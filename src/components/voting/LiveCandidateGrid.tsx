"use client";

import { useRealtimePollData } from "@/hooks/useRealtimePollData";

import { CandidateGrid } from "./CandidateGrid";

export function LiveCandidateGrid({ pollId }: { pollId: string }) {
  const { candidates } = useRealtimePollData(pollId);
  return <CandidateGrid pollId={pollId} candidates={candidates} />;
}
