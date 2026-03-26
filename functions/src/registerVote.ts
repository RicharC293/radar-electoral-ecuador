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

      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

      const result = await db.runTransaction(async (transaction) => {
        const configRef = db.collection("config").doc("global");
        const [pollDoc, candidateDoc, lockDoc, configDoc] = await Promise.all([
          transaction.get(pollRef),
          transaction.get(candidateRef),
          transaction.get(lockRef),
          transaction.get(configRef),
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

        let isUpdate = false;
        let previousCandidateId: string | null = null;
        let isElectionModeUpdate = false;

        const electionModeActive = configDoc.exists && configDoc.data()?.electionModeActive === true;

        if (lockDoc.exists) {
          const lockData = lockDoc.data()!;

          if (electionModeActive) {
            // Election mode: allow one-time update regardless of 30-day window
            if (lockData.electionModeUsed === true) {
              throw new HttpsError(
                "already-exists",
                "Ya usaste tu cambio durante el Modo Elecciones. Tu opinión actual está registrada."
              );
            }
            isUpdate = true;
            isElectionModeUpdate = true;
            previousCandidateId = lockData.candidateId as string;
          } else {
            // Normal 30-day rule
            const votedAt = (lockData.createdAt as Timestamp).toDate();
            const msSinceVote = Date.now() - votedAt.getTime();

            if (msSinceVote < THIRTY_DAYS_MS) {
              const canChangeAt = new Date(votedAt.getTime() + THIRTY_DAYS_MS);
              const formatted = canChangeAt.toLocaleDateString("es-EC", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "America/Guayaquil",
              });
              throw new HttpsError(
                "already-exists",
                `Tu opinión ya fue registrada. Podrás cambiarla a partir del ${formatted}.`
              );
            }

            isUpdate = true;
            previousCandidateId = lockData.candidateId as string;
          }
        }

        // Prevent voting positive and negative for the same candidate
        if (sentiment === "negative") {
          const positiveLock = await transaction.get(
            pollRef.collection("voterLocks").doc(`${fingerprintHash}_positive`)
          );
          if (positiveLock.exists && positiveLock.data()?.candidateId === input.candidateId) {
            throw new HttpsError("failed-precondition", "No puedes rechazar al candidato que apoyaste.");
          }
        } else {
          const negativeLock = await transaction.get(
            pollRef.collection("voterLocks").doc(`${fingerprintHash}_negative`)
          );
          if (negativeLock.exists && negativeLock.data()?.candidateId === input.candidateId) {
            throw new HttpsError("failed-precondition", "No puedes apoyar al candidato que rechazaste.");
          }
        }

        const timestamp = Timestamp.now();
        const sentimentField = sentiment === "positive" ? "positiveVotes" : "negativeVotes";
        const isChangingCandidate = isUpdate && previousCandidateId !== null && previousCandidateId !== input.candidateId;
        const candidateVoteIncrement = isUpdate && !isChangingCandidate ? 0 : 1;
        const previousTotalVotes = Number(pollData.totalVotes ?? 0);
        const nextTotalVotes = isUpdate ? previousTotalVotes : previousTotalVotes + 1;
        const nextCandidateVotes = Number(candidateDoc.data()?.totalVotes ?? 0) + candidateVoteIncrement;

        const today = new Date().toISOString().slice(0, 10);
        const candidateDailyRef = pollRef
          .collection("candidateStats")
          .doc(input.candidateId)
          .collection("daily")
          .doc(today);

        // Decrement old candidate if switching candidate
        if (isChangingCandidate) {
          const oldCandidateRef = pollRef.collection("candidates").doc(previousCandidateId!);
          transaction.set(
            oldCandidateRef,
            {
              totalVotes: FieldValue.increment(-1),
              [sentimentField]: FieldValue.increment(-1),
            },
            { merge: true }
          );
        }

        // Create or overwrite the voter lock (resets the 30-day window)
        transaction.set(lockRef, {
          fingerprintHash,
          candidateId: input.candidateId,
          sentiment,
          createdAt: timestamp,
          ...(isUpdate ? { updatedAt: timestamp } : {}),
          ...(isElectionModeUpdate ? { electionModeUsed: true } : {}),
        });

        // New vote document (kept as audit trail)
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
          createdAt: timestamp,
          ...(isUpdate ? { isUpdate: true } : {}),
        });

        // Update new candidate vote counts
        transaction.set(
          candidateRef,
          {
            ...(candidateVoteIncrement !== 0
              ? {
                  totalVotes: FieldValue.increment(candidateVoteIncrement),
                  [sentimentField]: FieldValue.increment(candidateVoteIncrement),
                }
              : {}),
            lastVoteAt: timestamp,
          },
          { merge: true }
        );

        // Update poll
        transaction.set(
          pollRef,
          {
            totalVotes: nextTotalVotes,
            ...(isUpdate ? {} : { totalVotersToday: FieldValue.increment(1) }),
            uniqueProvinces: Number(pollData.uniqueProvinces ?? 0),
            lastVoteAt: timestamp,
            lastVoteCity: input.city ?? null,
            lastVoteCandidateId: input.candidateId,
          },
          { merge: true }
        );

        // Daily stats
        transaction.set(
          dailyRef,
          {
            dateKey: dailyRef.id,
            totalVotes: FieldValue.increment(1),
            ...(isUpdate ? {} : { uniqueVoters: FieldValue.increment(1) }),
            updatedAt: timestamp,
          },
          { merge: true }
        );

        // Daily stats per candidate (for trend charts)
        if (candidateVoteIncrement !== 0) {
          transaction.set(
            candidateDailyRef,
            {
              dateKey: today,
              [sentimentField]: FieldValue.increment(candidateVoteIncrement),
              totalVotes: FieldValue.increment(candidateVoteIncrement),
              updatedAt: timestamp,
            },
            { merge: true }
          );
        }

        // Decrement old candidate daily stats when switching
        if (isChangingCandidate) {
          const oldCandidateDailyRef = pollRef
            .collection("candidateStats")
            .doc(previousCandidateId!)
            .collection("daily")
            .doc(today);
          transaction.set(
            oldCandidateDailyRef,
            {
              dateKey: today,
              [sentimentField]: FieldValue.increment(-1),
              totalVotes: FieldValue.increment(-1),
              updatedAt: timestamp,
            },
            { merge: true }
          );
        }

        return {
          success: true as const,
          totalVotes: nextTotalVotes,
          candidateTotal: nextCandidateVotes,
          isUpdate,
          isElectionModeUpdate,
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
