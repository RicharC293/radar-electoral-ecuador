import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { jsonError, requireAdmin } from "@/lib/admin-auth-server";
import { adminDb } from "@/lib/firebase/admin";

const createCandidateSchema = z.object({
  fullName: z.string().trim().min(3),
  party: z.string().trim().optional().default(""),
  photoUrl: z.union([z.string().trim().url(), z.literal("")]).default(""),
  color: z.string().trim().regex(/^#([0-9A-Fa-f]{6})$/),
  sortOrder: z.coerce.number().int().min(1),
  biography: z.string().optional().default(""),
  isActive: z.boolean()
});

function serializeTimestamp(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const { pollId } = await params;
  const pollRef = adminDb.collection("polls").doc(pollId);

  // Vote data is now embedded in candidate docs — no join needed
  const candidatesSnapshot = await pollRef
    .collection("candidates")
    .orderBy("sortOrder", "asc")
    .get();

  return NextResponse.json({
    candidates: candidatesSnapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        fullName: data.fullName,
        party: data.party,
        photoUrl: data.photoUrl ?? "",
        color: data.color,
        sortOrder: data.sortOrder,
        biography: data.biography ?? "",
        isActive: data.isActive === true,
        createdAt: serializeTimestamp(data.createdAt),
        totalVotes: data.totalVotes ?? 0,
        percentage: data.percentage ?? 0
      };
    })
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = createCandidateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid candidate payload.");
  }

  const { pollId } = await params;
  const pollRef = adminDb.collection("polls").doc(pollId);
  const candidateRef = pollRef.collection("candidates").doc();
  const now = Timestamp.now();

  const batch = adminDb.batch();
  batch.set(candidateRef, {
    fullName: parsed.data.fullName,
    party: parsed.data.party,
    photoUrl: parsed.data.photoUrl,
    color: parsed.data.color,
    sortOrder: parsed.data.sortOrder,
    biography: parsed.data.biography,
    isActive: parsed.data.isActive,
    createdAt: now,
    // Vote data defaults (embedded, no separate voteCounts doc)
    totalVotes: 0,
    percentage: 0,
    lastVoteAt: null
  });
  batch.set(pollRef, { updatedAt: now }, { merge: true });

  await batch.commit();

  return NextResponse.json({ success: true, id: candidateRef.id });
}
