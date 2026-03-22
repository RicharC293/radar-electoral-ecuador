import { randomUUID } from "node:crypto";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { db } from "./lib/firebase";
import { secureHash } from "./lib/hash";
import { enforceIpVoteRateLimit } from "./lib/rate-limit";
import { registerVoteSchema } from "./lib/validation";

function getIp(request: {
  rawRequest: {
    headers: Record<string, string | string[] | undefined>;
    ip?: string;
  };
}) {
  const forwarded = request.rawRequest.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.rawRequest.ip ?? "unknown";
}

export const registerVote = onCall(
  {
    cors: true,
    region: "us-central1",
    secrets: ["APP_SECRET"]
  },
  async (request) => {
    try {
      const parsed = registerVoteSchema.safeParse(request.data);
      if (!parsed.success) {
        throw new HttpsError("invalid-argument", "Payload invalido.");
      }

      const userAgent = request.rawRequest.headers["user-agent"] ?? "unknown";
      if (/bot|spider|crawler|headless|curl|wget/i.test(String(userAgent))) {
        throw new HttpsError("permission-denied", "Cliente no permitido.");
      }

      const input = parsed.data;
      const ip = getIp(request);
      await enforceIpVoteRateLimit(ip);

      const sentiment = (input.sentiment ?? "positive") as "positive" | "negative";
      const fingerprintHash = secureHash(input.fingerprint);
      const ipHash = secureHash(ip);
      const pollRef = db.collection("polls").doc(input.pollId);
      const candidateRef = pollRef.collection("candidates").doc(input.candidateId);
      const lockId = `${fingerprintHash}_${sentiment}`;
      const lockRef = pollRef.collection("voterLocks").doc(lockId);
      const voteRef = pollRef.collection("votes").doc(randomUUID());
      const dailyRef = pollRef.collection("statsDaily").doc(new Date().toISOString().slice(0, 10));

      const result = await db.runTransaction(async (transaction) => {
        const [pollDoc, candidateDoc, lockDoc] = await Promise.all([
          transaction.get(pollRef),
          transaction.get(candidateRef),
          transaction.get(lockRef)
        ]);

        if (!pollDoc.exists) {
          throw new HttpsError("not-found", "Encuesta no encontrada.");
        }

        const pollData = pollDoc.data();
        if (!pollData || pollData.status !== "live") {
          throw new HttpsError("failed-precondition", "El radar no está disponible.");
        }

        if (!candidateDoc.exists || candidateDoc.data()?.isActive !== true) {
          throw new HttpsError("failed-precondition", "Candidatura no disponible.");
        }

        if (lockDoc.exists) {
          throw new HttpsError("already-exists", sentiment === "positive"
            ? "Ya registramos tu respaldo."
            : "Ya registramos tu opinión negativa.");
        }

        // Prevent voting positive and negative for the same candidate
        if (sentiment === "negative") {
          const positiveLock = await transaction.get(
            pollRef.collection("voterLocks").doc(`${fingerprintHash}_positive`)
          );
          if (positiveLock.exists && positiveLock.data()?.candidateId === input.candidateId) {
            throw new HttpsError("failed-precondition", "No puedes rechazar al candidato que respaldaste.");
          }
        } else {
          const negativeLock = await transaction.get(
            pollRef.collection("voterLocks").doc(`${fingerprintHash}_negative`)
          );
          if (negativeLock.exists && negativeLock.data()?.candidateId === input.candidateId) {
            throw new HttpsError("failed-precondition", "No puedes respaldar al candidato que rechazaste.");
          }
        }

        const timestamp = Timestamp.now();
        const previousCandidateVotes = Number(candidateDoc.data()?.totalVotes ?? 0);
        const nextCandidateVotes = previousCandidateVotes + 1;
        const previousTotalVotes = Number(pollData.totalVotes ?? 0);
        const nextTotalVotes = previousTotalVotes + 1;
        const uniqueProvinces = Number(pollData.uniqueProvinces ?? 0);

        transaction.create(lockRef, {
          fingerprintHash,
          candidateId: input.candidateId,
          sentiment,
          createdAt: timestamp
        });

        transaction.create(voteRef, {
          candidateId: input.candidateId,
          sentiment,
          fingerprintHash,
          ipHash,
          city: input.city ?? null,
          province: input.province ?? null,
          country: input.country ?? "EC",
          latitudeApprox:
            typeof input.latitude === "number" ? Number(input.latitude.toFixed(2)) : null,
          longitudeApprox:
            typeof input.longitude === "number" ? Number(input.longitude.toFixed(2)) : null,
          userAgent,
          createdAt: timestamp
        });

        const sentimentField = sentiment === "positive" ? "positiveVotes" : "negativeVotes";
        transaction.set(
          candidateRef,
          {
            totalVotes: FieldValue.increment(1),
            [sentimentField]: FieldValue.increment(1),
            lastVoteAt: timestamp
          },
          { merge: true }
        );

        transaction.set(
          pollRef,
          {
            totalVotes: nextTotalVotes,
            totalVotersToday: FieldValue.increment(1),
            uniqueProvinces,
            lastVoteAt: timestamp,
            lastVoteCity: input.city ?? null,
            lastVoteCandidateId: input.candidateId
          },
          { merge: true }
        );

        transaction.set(
          dailyRef,
          {
            dateKey: dailyRef.id,
            totalVotes: FieldValue.increment(1),
            uniqueVoters: FieldValue.increment(1),
            updatedAt: timestamp
          },
          { merge: true }
        );

        return {
          success: true as const,
          totalVotes: nextTotalVotes,
          candidateTotal: nextCandidateVotes
        };
      });

      return result;
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      if (error instanceof Error && error.message === "rate_limited") {
        throw new HttpsError("resource-exhausted", "Demasiados intentos desde esta IP.");
      }

      if (
        error instanceof Error &&
        error.message.includes("APP_SECRET is not configured")
      ) {
        throw new HttpsError("failed-precondition", "Falta configurar APP_SECRET.");
      }

      throw new HttpsError("internal", "No pudimos registrar tu opinión.");
    }
  }
);
