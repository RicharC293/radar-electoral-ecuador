import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { jsonError, requireAdmin } from "@/lib/admin-auth-server";
import { adminDb } from "@/lib/firebase/admin";

const updateConfigSchema = z.object({
  electionModeActive: z.boolean(),
});

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  const body = await request.json().catch(() => null);
  const parsed = updateConfigSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid config payload.");

  await adminDb
    .collection("config")
    .doc("global")
    .set({ ...parsed.data, updatedAt: Timestamp.now() }, { merge: true });

  return NextResponse.json({ success: true });
}
