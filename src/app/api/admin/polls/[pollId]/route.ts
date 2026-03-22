import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { jsonError, requireAdmin } from "@/lib/admin-auth-server";
import { adminDb } from "@/lib/firebase/admin";

const updatePollSchema = z.object({
  title: z.string().trim().min(3).optional(),
  subtitle: z.string().trim().optional(),
  province: z.string().trim().nullable().optional(),
  status: z.enum(["draft", "live", "paused", "closed", "archived"]).optional(),
  isPublic: z.boolean().optional(),
  allowNegativeVote: z.boolean().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = updatePollSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid poll update payload.");
  }

  const { pollId } = await params;
  await adminDb
    .collection("polls")
    .doc(pollId)
    .set(
      {
        ...parsed.data,
        updatedAt: Timestamp.now()
      },
      { merge: true }
    );

  return NextResponse.json({ success: true });
}
