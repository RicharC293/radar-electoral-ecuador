import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

import { jsonError, requireAdmin } from "@/lib/admin-auth-server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function fileExtension(file: File) {
  const fromType = file.type.split("/")[1];
  if (fromType) {
    return fromType === "jpeg" ? "jpg" : fromType;
  }

  return file.name.split(".").pop()?.toLowerCase() || "jpg";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pollId: string; candidateId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return jsonError("Missing photo file.");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError("Only JPG, PNG or WEBP images are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError("Image exceeds the 5MB limit.");
  }

  const { pollId, candidateId } = await params;
  const pollRef = adminDb.collection("polls").doc(pollId);
  const candidateRef = pollRef.collection("candidates").doc(candidateId);
  const candidateDoc = await candidateRef.get();

  if (!candidateDoc.exists) {
    return jsonError("Candidate not found.", 404);
  }

  const extension = fileExtension(file);
  const filename = `${Timestamp.now().toMillis()}-${randomUUID()}.${extension}`;
  const objectPath = `polls/${pollId}/candidates/${candidateId}/${filename}`;
  const token = randomUUID();
  const bucket = adminStorage.bucket();
  const object = bucket.file(objectPath);

  await object.save(Buffer.from(await file.arrayBuffer()), {
    resumable: false,
    contentType: file.type,
    metadata: {
      cacheControl: "public,max-age=31536000,immutable",
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  });

  const photoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;

  await Promise.all([
    candidateRef.set({ photoUrl }, { merge: true }),
    pollRef.set({ updatedAt: Timestamp.now() }, { merge: true })
  ]);

  return NextResponse.json({ success: true, photoUrl });
}
