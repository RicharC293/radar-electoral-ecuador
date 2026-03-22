"use client";

import { RankingBars } from "@/components/results/RankingBars";
import { StatsCounter } from "@/components/results/StatsCounter";
import { useRealtimePollData } from "@/hooks/useRealtimePollData";
import type { Poll } from "@/types";

export function InlineResults({ poll }: { poll: Poll }) {
  const { ranked, lastChange } = useRealtimePollData(poll.id);

  return (
    <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCounter label="Opiniones" value={poll.totalVotes} />
        <StatsCounter label="Hoy" value={poll.totalVotersToday} />
        <StatsCounter label="Provincias" value={poll.uniqueProvinces} />
      </div>
      <RankingBars results={ranked} lastChange={lastChange} />
    </section>
  );
}
