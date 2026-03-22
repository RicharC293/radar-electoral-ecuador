import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";

const SLUG = "prefectura-cotopaxi-2025";

const CANDIDATES = [
  { fullName: "María Álvarez", party: "Alianza Nacional", color: "#1D9E75", totalVotes: 1844, sortOrder: 1 },
  { fullName: "Carlos Ruiz", party: "Mov. Ciudadano", color: "#EF9F27", totalVotes: 1371, sortOrder: 2 },
  { fullName: "Laura Paredes", party: "Frente Progresista", color: "#378ADD", totalVotes: 903, sortOrder: 3 },
  { fullName: "Jorge Mendoza", party: "Partido Independiente", color: "#7F77DD", totalVotes: 459, sortOrder: 4 },
  { fullName: "Rosa Pinto", party: "Unidad Popular", color: "#D85A30", totalVotes: 250, sortOrder: 5 },
] as const;

const TOTAL_VOTES = 4827;

/**
 * POST /api/admin/seed
 *
 * Seeds Firestore with the Cotopaxi poll using the optimized data model:
 *   - Stats embedded in the poll document (no `stats/current` subcollection)
 *   - Vote data embedded in candidate documents (no `voteCounts` subcollection)
 *
 * Safe to call multiple times — skips if the slug already exists.
 */
export async function POST() {
  try {
    const existing = await adminDb.collection("polls").where("slug", "==", SLUG).get();

    if (!existing.empty) {
      return NextResponse.json(
        { message: "La encuesta ya existe.", pollId: existing.docs[0]?.id },
        { status: 200 }
      );
    }

    const pollRef = adminDb.collection("polls").doc();
    const batch = adminDb.batch();
    const now = Timestamp.now();

    // Poll document with embedded stats
    batch.set(pollRef, {
      title: "Intención de voto — Prefectura Cotopaxi",
      slug: SLUG,
      subtitle: "Encuesta popular en vivo",
      electionType: "prefectura",
      province: "Cotopaxi",
      status: "live",
      isPublic: true,
      startsAt: null,
      endsAt: null,
      createdAt: now,
      updatedAt: now,
      // Embedded stats
      totalVotes: TOTAL_VOTES,
      totalVotersToday: 312,
      uniqueProvinces: 18,
      lastVoteCity: "Latacunga",
      lastVoteAt: now,
      lastVoteCandidateId: null,
    });

    // Candidate documents with embedded vote data
    for (const c of CANDIDATES) {
      const candidateRef = pollRef.collection("candidates").doc();

      batch.set(candidateRef, {
        fullName: c.fullName,
        party: c.party,
        color: c.color,
        photoUrl: "",
        sortOrder: c.sortOrder,
        isActive: true,
        createdAt: now,
        // Embedded vote data
        totalVotes: c.totalVotes,
        percentage: Number(((c.totalVotes / TOTAL_VOTES) * 100).toFixed(1)),
        lastVoteAt: now,
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true, pollId: pollRef.id });
  } catch (error) {
    console.error("[seed]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
