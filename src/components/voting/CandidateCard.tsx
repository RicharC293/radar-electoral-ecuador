"use client";

import Image from "next/image";
import { useState } from "react";

import { useToast } from "@/components/ui/ToastProvider";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useVote } from "@/hooks/useVote";
import { initialsFromName } from "@/lib/utils";
import type { Candidate } from "@/types";

export function CandidateCard({
  pollId,
  candidate
}: {
  pollId: string;
  candidate: Candidate;
}) {
  const { location } = useGeolocation(); // location resolved by parent's LocationExplainer
  const { submitVote, loading, success, error } = useVote();
  const { pushToast } = useToast();
  const [done, setDone] = useState(false);

  async function handleVote() {
    try {
      await submitVote({
        pollId,
        candidateId: candidate.id,
        sentiment: "positive",
        city: location.city,
        province: location.province,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude
      });

      setDone(true);
      pushToast({
        tone: "success",
        title: "Opinión registrada",
        description: `Tu respaldo a ${candidate.fullName} fue registrado.`
      });
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Intenta nuevamente en unos segundos.";
      const isAlready = msg.includes("Ya registramos");
      pushToast({
        tone: isAlready ? "info" : "error",
        title: isAlready ? "Ya participaste" : "Algo salió mal",
        description: msg,
      });
    }
  }

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow">
      <div className="mb-4 flex items-center gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-white/10">
          {candidate.photoUrl ? (
            <Image src={candidate.photoUrl} alt={candidate.fullName} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="grid h-full w-full place-items-center text-lg font-semibold text-white">
              {initialsFromName(candidate.fullName)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-semibold text-white">{candidate.fullName}</p>
          <p className="truncate text-sm text-white/55">{candidate.party || "Sin casillero electoral"}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleVote()}
        disabled={loading || done}
        className="w-full rounded-2xl bg-emerald-500/15 px-4 py-3 font-medium text-emerald-400 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Registrando..." : done ? "Registrado" : "Respaldar"}
      </button>

      {success ? <p className="mt-3 text-sm text-emerald-300">Tu opinión fue registrada.</p> : null}
      {error && !success ? <p className="mt-3 text-sm text-white/45">Revisa la notificación.</p> : null}
    </article>
  );
}
