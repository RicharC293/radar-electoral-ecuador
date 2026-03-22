import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { jsonError, requireAdmin } from "@/lib/admin-auth-server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";

const updateCandidateSchema = z.object({
  fullName: z.string().trim().min(3).optional(),
  party: z.string().trim().optional(),
  photoUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  color: z.string().trim().regex(/^#([0-9A-Fa-f]{6})$/).optional(),
  sortOrder: z.coerce.number().int().min(1).optional(),
  biography: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ pollId: string; candidateId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = updateCandidateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid candidate update payload.");
  }

  const { pollId, candidateId } = await params;
  const pollRef = adminDb.collection("polls").doc(pollId);
  const candidateRef = pollRef.collection("candidates").doc(candidateId);
  const batch = adminDb.batch();

  batch.set(candidateRef, parsed.data, { merge: true });
  batch.set(pollRef, { updatedAt: Timestamp.now() }, { merge: true });
  await batch.commit();

  return NextResponse.json({ success: true });
}

function storagePathFromPhotoUrl(photoUrl: string | undefined) {
  if (!photoUrl || !photoUrl.includes("/o/")) {
    return null;
  }

  const encodedPath = photoUrl.split("/o/")[1]?.split("?")[0];
  return encodedPath ? decodeURIComponent(encodedPath) : null;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ pollId: string; candidateId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const { pollId, candidateId } = await params;
  const pollRef = adminDb.collection("polls").doc(pollId);
  const candidateRef = pollRef.collection("candidates").doc(candidateId);

  const candidateDoc = await candidateRef.get();

  if (!candidateDoc.exists) {
    return jsonError("Candidate not found.", 404);
  }

  // Vote data is now embedded in the candidate doc
  const totalVotes = Number(candidateDoc.data()?.totalVotes ?? 0);
  if (totalVotes > 0) {
    return jsonError("Cannot delete a candidate that already has votes.", 409);
  }

  const batch = adminDb.batch();
  batch.delete(candidateRef);
  batch.set(pollRef, { updatedAt: Timestamp.now() }, { merge: true });
  await batch.commit();

  const photoUrl = candidateDoc.data()?.photoUrl as string | undefined;
  const objectPath = storagePathFromPhotoUrl(photoUrl);

  if (objectPath) {
    await adminStorage
      .bucket()
      .file(objectPath)
      .delete({ ignoreNotFound: true })
      .catch(() => undefined);
  }

  return NextResponse.json({ success: true });
}
