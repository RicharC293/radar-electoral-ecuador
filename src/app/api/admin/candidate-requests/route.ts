import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

import { requireAdmin } from "@/lib/admin-auth-server";
import { adminDb } from "@/lib/firebase/admin";

function serializeTimestamp(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  const snapshot = await adminDb.collection("candidateRequests").orderBy("createdAt", "desc").get();

  return NextResponse.json({
    requests: snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        pollId: data.pollId ?? null,
        requesterName: data.requesterName,
        requesterContact: data.requesterContact,
        candidateName: data.candidateName,
        candidateParty: data.candidateParty,
        notes: data.notes ?? "",
        status: data.status,
        createdAt: serializeTimestamp(data.createdAt)
      };
    })
  });
}
