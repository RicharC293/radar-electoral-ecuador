import type { Candidate } from "@/types";

import { CandidateCard } from "./CandidateCard";

export function CandidateGrid({
  pollId,
  candidates
}: {
  pollId: string;
  candidates: Candidate[];
}) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.id} pollId={pollId} candidate={candidate} />
      ))}
    </section>
  );
}
