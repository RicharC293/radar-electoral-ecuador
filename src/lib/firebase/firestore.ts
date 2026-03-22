import {
  collection,
  getDocs,
  orderBy,
  query,
  where
} from "firebase/firestore";

import type { Candidate, Poll } from "@/types";
import { db } from "@/lib/firebase/config";

/* ── Hydration helpers (defaults for embedded vote/stats fields) ── */

export function toPoll(id: string, data: Record<string, unknown>): Poll {
  return {
    ...(data as Omit<Poll, "id">),
    id,
    allowNegativeVote: (data.allowNegativeVote as boolean) ?? false,
    totalVotes: (data.totalVotes as number) ?? 0,
    totalVotersToday: (data.totalVotersToday as number) ?? 0,
    uniqueProvinces: (data.uniqueProvinces as number) ?? 0,
    lastVoteCity: (data.lastVoteCity as string | null) ?? null,
    lastVoteAt: (data.lastVoteAt as Date | null) ?? null,
    lastVoteCandidateId: (data.lastVoteCandidateId as string | null) ?? null,
  };
}

export function toCandidate(id: string, data: Record<string, unknown>): Candidate {
  return {
    ...(data as Omit<Candidate, "id">),
    id,
    biography: (data.biography as string) ?? "",
    totalVotes: (data.totalVotes as number) ?? 0,
    percentage: (data.percentage as number) ?? 0,
    positiveVotes: (data.positiveVotes as number) ?? 0,
    negativeVotes: (data.negativeVotes as number) ?? 0,
    positivePercentage: (data.positivePercentage as number) ?? 0,
    negativePercentage: (data.negativePercentage as number) ?? 0,
    lastVoteAt: (data.lastVoteAt as Date | null) ?? null,
  };
}

/* ── Server-side fetchers ── */

export async function getPollBySlug(slug: string): Promise<Poll | null> {
  const snapshot = await getDocs(
    query(collection(db, "polls"), where("slug", "==", slug), where("isPublic", "==", true))
  );

  const first = snapshot.docs[0];
  return first ? toPoll(first.id, first.data()) : null;
}

export async function getPollCandidates(pollId: string): Promise<Candidate[]> {
  const snapshot = await getDocs(
    query(collection(db, "polls", pollId, "candidates"), orderBy("sortOrder", "asc"))
  );

  return snapshot.docs.map((item) => toCandidate(item.id, item.data()));
}

/** Fetch all public polls (for SEO metadata generation) */
export async function getPublicPolls(): Promise<Poll[]> {
  const snapshot = await getDocs(
    query(collection(db, "polls"), where("isPublic", "==", true))
  );

  return snapshot.docs.map((doc) => toPoll(doc.id, doc.data()));
}
