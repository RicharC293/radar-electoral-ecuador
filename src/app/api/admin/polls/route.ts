import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { jsonError, requireAdmin } from "@/lib/admin-auth-server";
import { adminDb } from "@/lib/firebase/admin";

const createPollSchema = z.object({
  slug: z.string().trim().min(3),
  title: z.string().trim().min(3),
  subtitle: z.string().trim().optional().default(""),
  electionType: z.enum(["presidencia", "prefectura", "alcaldia"]),
  province: z.string().trim().optional().default(""),
  status: z.enum(["draft", "live", "paused", "closed", "archived"]),
  isPublic: z.boolean(),
  allowNegativeVote: z.boolean().optional().default(false)
});

function serializeTimestamp(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const snapshot = await adminDb.collection("polls").orderBy("updatedAt", "desc").get();

  return NextResponse.json({
    polls: snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle ?? "",
        electionType: data.electionType,
        province: data.province ?? null,
        status: data.status,
        isPublic: data.isPublic === true,
        allowNegativeVote: data.allowNegativeVote === true,
        createdAt: serializeTimestamp(data.createdAt),
        updatedAt: serializeTimestamp(data.updatedAt)
      };
    })
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = createPollSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid poll payload.");
  }

  const data = parsed.data;
  const pollId = data.slug.toLowerCase();
  const pollRef = adminDb.collection("polls").doc(pollId);

  if ((await pollRef.get()).exists) {
    return jsonError("A poll with this slug already exists.", 409);
  }

  const now = Timestamp.now();

  await pollRef.set({
    slug: pollId,
    title: data.title,
    subtitle: data.subtitle || "",
    electionType: data.electionType,
    province: data.province || null,
    status: data.status,
    isPublic: data.isPublic,
    allowNegativeVote: data.allowNegativeVote,
    startsAt: null,
    endsAt: null,
    createdAt: now,
    updatedAt: now,
    // Embedded stats (no separate stats subcollection)
    totalVotes: 0,
    totalVotersToday: 0,
    uniqueProvinces: 0,
    lastVoteAt: null,
    lastVoteCity: null,
    lastVoteCandidateId: null
  });

  return NextResponse.json({ success: true, id: pollId });
}
