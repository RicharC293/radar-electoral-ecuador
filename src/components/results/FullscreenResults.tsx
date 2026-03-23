"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

import { ConfettiLayer } from "@/components/results/ConfettiLayer";
import { VoteTicker } from "@/components/results/VoteTicker";
import { CandidateBioModal } from "@/components/voting/CandidateBioModal";
import { PulseDot } from "@/components/ui/PulseDot";
import { useConfetti } from "@/hooks/useConfetti";
import { useRealtimePollData } from "@/hooks/useRealtimePollData";
import { initialsFromName, formatNumber } from "@/lib/utils";
import type { Candidate, Poll, VoteSentiment } from "@/types";

export function FullscreenResults({ poll }: { poll: Poll }) {
  const { ranked, rankedPositive, rankedNegative, lastChange } = useRealtimePollData(poll.id);
  const confettiActive = useConfetti(lastChange);
  const [sentiment, setSentiment] = useState<VoteSentiment>("positive");
  const [bioCandidate, setBioCandidate] = useState<Candidate | null>(null);

  const activeRanked = poll.allowNegativeVote
    ? sentiment === "positive"
      ? rankedPositive
      : rankedNegative
    : ranked;

  return (
    <>
    <section className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-glow backdrop-blur">
      <ConfettiLayer active={confettiActive} />

      {/* Header */}
      <div className="px-5 pb-4 pt-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
          <PulseDot />
          En vivo
        </div>
        <h1 className="text-xl font-semibold text-white">{poll.title}</h1>
        <p className="mt-1 text-xs text-white/35">
          {formatNumber(poll.totalVotes)} {poll.totalVotes === 1 ? "opinión" : "opiniones"}
          {poll.totalVotersToday > 0 ? ` · ${formatNumber(poll.totalVotersToday)} hoy` : ""}
        </p>
      </div>

      {/* Sentiment toggle — only if negative votes enabled */}
      {poll.allowNegativeVote ? (
        <div className="px-4 pb-2">
          <SentimentToggle value={sentiment} onChange={setSentiment} />
        </div>
      ) : null}

      {/* Ranking list */}
      <div className="px-4 pb-2 pt-3">
        {activeRanked.map((candidate, index) => (
          <RankingRow
            key={candidate.id}
            candidate={candidate}
            rank={index + 1}
            isLeader={index === 0}
            isNew={lastChange === candidate.id}
            sentiment={poll.allowNegativeVote ? sentiment : undefined}
            onTap={candidate.biography ? () => setBioCandidate(candidate) : undefined}
          />
        ))}
      </div>

      {/* Ticker */}
      <div className="border-t border-white/5 px-5 py-3">
        <VoteTicker city={poll.lastVoteCity} />
      </div>

      {/* Back to vote */}
      <div className="px-5 pb-5">
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12H4l8-8 8 8h-5" />
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
          </svg>
          Participar en el sondeo
        </Link>
      </div>

    </section>

    {/* Bio modal — outside the overflow-hidden section */}
    <CandidateBioModal
      open={!!bioCandidate}
      candidate={bioCandidate}
      onClose={() => setBioCandidate(null)}
    />
    </>
  );
}

/* ── Sentiment toggle ── */

function SentimentToggle({
  value,
  onChange,
}: {
  value: VoteSentiment;
  onChange: (v: VoteSentiment) => void;
}) {
  return (
    <div className="relative flex rounded-2xl border border-white/10 bg-white/5 p-1">
      {/* Sliding background */}
      <motion.div
        className="absolute inset-y-1 rounded-xl"
        initial={false}
        animate={{
          left: value === "positive" ? "4px" : "50%",
          right: value === "positive" ? "50%" : "4px",
          backgroundColor: value === "positive" ? "rgba(52,211,153,0.15)" : "rgba(251,113,133,0.15)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      <button
        type="button"
        onClick={() => onChange("positive")}
        className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
          value === "positive" ? "text-emerald-400" : "text-white/40"
        }`}
      >
        <span>👍</span>
        <span>A favor</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("negative")}
        className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
          value === "negative" ? "text-rose-400" : "text-white/40"
        }`}
      >
        <span>👎</span>
        <span>En contra</span>
      </button>
    </div>
  );
}

/* ── Ranking row ── */

function RankingRow({
  candidate,
  rank,
  isLeader = false,
  isNew,
  sentiment,
  onTap,
}: {
  candidate: Candidate;
  rank: number;
  isLeader?: boolean;
  isNew: boolean;
  sentiment?: VoteSentiment;
  onTap?: () => void;
}) {
  const displayVotes = sentiment === "positive"
    ? candidate.positiveVotes
    : sentiment === "negative"
      ? candidate.negativeVotes
      : candidate.totalVotes;

  const displayPercentage = sentiment === "positive"
    ? candidate.positivePercentage
    : sentiment === "negative"
      ? candidate.negativePercentage
      : candidate.percentage;

  const barColor = sentiment === "negative" ? "#fb7185" : candidate.color;
  const declined = !candidate.isActive;

  return (
    <motion.div
      layout
      onClick={onTap}
      className={`flex items-center gap-3 rounded-2xl px-3 ${onTap ? "cursor-pointer" : ""} ${
        declined
          ? "py-2.5 opacity-45"
          : isLeader
            ? "mb-1 border border-white/10 py-3"
            : "py-2.5"
      }`}
      style={isLeader && !declined ? { backgroundColor: `${barColor}12` } : undefined}
      animate={{
        backgroundColor: isNew
          ? "rgba(255,255,255,0.08)"
          : isLeader && !declined
            ? `${barColor}12`
            : "transparent",
      }}
    >
      <span className={`w-5 text-center font-medium ${isLeader && !declined ? "text-base text-white/50" : "text-sm text-white/30"}`}>
        {rank}
      </span>

      <div
        className={`relative shrink-0 overflow-hidden ${
          declined
            ? "size-9 rounded-xl grayscale"
            : isLeader
              ? "size-12 rounded-2xl ring-2 ring-white/15"
              : "size-9 rounded-xl"
        }`}
        style={{ backgroundColor: candidate.color }}
      >
        {candidate.photoUrl ? (
          <Image src={candidate.photoUrl} alt={candidate.fullName} fill className="object-cover" sizes={isLeader && !declined ? "48px" : "36px"} />
        ) : (
          <div className={`grid h-full w-full place-items-center font-semibold text-white ${isLeader && !declined ? "text-sm" : "text-xs"}`}>
            {initialsFromName(candidate.fullName)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className={`truncate font-medium ${declined ? "text-sm text-white/50" : isLeader ? "text-base text-white" : "text-sm text-white"}`}>{candidate.fullName}</p>
          {declined ? (
            <span className="shrink-0 rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-white/35">
              Declinó
            </span>
          ) : isLeader ? (
            <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-medium uppercase ${
              sentiment === "negative"
                ? "bg-rose-400/15 text-rose-400/70"
                : "bg-white/10 text-white/50"
            }`}>
              {sentiment === "negative" ? "Top ↓" : "Lidera"}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className={`flex-1 overflow-hidden rounded-full bg-white/10 ${isLeader ? "h-2" : "h-1.5"}`}>
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{ width: `${displayPercentage}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              style={{ backgroundColor: barColor }}
            />
          </div>
          <span className={`text-right font-semibold ${isLeader ? "w-12 text-sm text-white" : "w-10 text-xs text-white/60"}`}>
            {displayPercentage}%
          </span>
        </div>
      </div>

      <p className={`text-white/30 ${isLeader ? "text-sm" : "text-xs"}`}>{formatNumber(displayVotes)}</p>
    </motion.div>
  );
}
