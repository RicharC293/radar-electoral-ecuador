import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { jsonError, requireAdmin } from "@/lib/admin-auth-server";
import { adminDb } from "@/lib/firebase/admin";

const patchSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Estado inválido.");
  }

  const { requestId } = await params;
  const docRef = adminDb.collection("candidateRequests").doc(requestId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return jsonError("Solicitud no encontrada.", 404);
  }

  await docRef.update({
    status: parsed.data.status,
    reviewedAt: Timestamp.now(),
  });

  return NextResponse.json({ success: true });
}
