"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { VoteConfirmation } from "@/components/voting/VoteConfirmation";
import { CandidateBioModal } from "@/components/voting/CandidateBioModal";
import { RequestCandidateModal } from "@/components/forms/RequestCandidateModal";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { useGeolocation } from "@/hooks/useGeolocation";
import { LocationExplainer } from "@/components/ui/LocationExplainer";
import { usePublicPolls } from "@/hooks/usePublicPolls";
import { useRealtimePollData } from "@/hooks/useRealtimePollData";
import { useVote } from "@/hooks/useVote";
import { useToast } from "@/components/ui/ToastProvider";
import { initialsFromName } from "@/lib/utils";
import type { Candidate, VoteSentiment } from "@/types";

export function PublicHomeShell() {
  const { polls, loading } = usePublicPolls();
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);

  const activePollId = selectedPollId ?? polls[0]?.id ?? null;
  const activePoll = polls.find((p) => p.id === activePollId) ?? null;

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4 py-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Radar Electoral</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">¿A quién respaldas?</h1>
      </header>

      {/* Poll selector */}
      {polls.length > 1 ? (
        <div className="mb-5">
          <select
            value={activePollId ?? ""}
            onChange={(e) => setSelectedPollId(e.target.value || null)}
            className="select-styled w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          >
            {polls.map((poll) => (
              <option key={poll.id} value={poll.id}>
                {poll.title}
              </option>
            ))}
          </select>
        </div>
      ) : activePoll ? (
        <p className="mb-5 text-center text-sm text-white/40">{activePoll.title}</p>
      ) : null}

      {/* Content */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-white/40">Cargando...</p>
        </div>
      ) : !activePoll ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg font-medium text-white/60">No hay radares activos</p>
          <p className="text-sm text-white/35">Vuelve pronto para participar.</p>
        </div>
      ) : (
        <>
          <InfoBanner pollId={activePoll.id} />
          <VotingGrid pollId={activePoll.id} pollSlug={activePoll.slug} allowNegativeVote={activePoll.allowNegativeVote} />
        </>
      )}
    </main>
  );
}

const VOTE_STORAGE_KEY = "radar-votes-v3";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface SavedVoteEntry {
  candidateId: string;
  votedAt: number; // ms timestamp
}

interface SavedPollVotes {
  positive?: SavedVoteEntry;
  negative?: SavedVoteEntry;
}

function getSavedVotes(pollId: string): SavedPollVotes {
  try {
    const raw = localStorage.getItem(VOTE_STORAGE_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw) as Record<string, SavedPollVotes>;
    return all[pollId] ?? {};
  } catch {
    return {};
  }
}

function saveVote(pollId: string, candidateId: string, sentiment: VoteSentiment, votedAt = Date.now()) {
  try {
    const raw = localStorage.getItem(VOTE_STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, SavedPollVotes>) : {};
    if (!all[pollId]) all[pollId] = {};
    all[pollId][sentiment] = { candidateId, votedAt };
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage not available
  }
}

function VotingGrid({ pollId, pollSlug, allowNegativeVote }: { pollId: string; pollSlug: string; allowNegativeVote: boolean }) {
  const { candidates, activeCandidates } = useRealtimePollData(pollId);
  const { location, status: geoStatus, request: requestGeo, dismiss: dismissGeo } = useGeolocation();
  const { submitVote } = useVote();
  const { pushToast } = useToast();

  // Track votes per sentiment
  const [positiveVotedId, setPositiveVotedId] = useState<string | null>(null);
  const [negativeVotedId, setNegativeVotedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingSentiment, setLoadingSentiment] = useState<VoteSentiment | null>(null);

  // Step: "positive" = voting for, "negative" = voting against, "done" = finished
  const [step, setStep] = useState<"positive" | "negative" | "done">("positive");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [bioCandidate, setBioCandidate] = useState<Candidate | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [positiveVotedAt, setPositiveVotedAt] = useState<number>(0);

  // Check returning voter
  useEffect(() => {
    const saved = getSavedVotes(pollId);
    const positiveEntry = saved.positive;
    const negativeEntry = saved.negative;

    const hasPositive = !!positiveEntry;
    const hasNegative = !!negativeEntry;

    // Check if 30-day update window has opened
    const positiveExpired =
      hasPositive && positiveEntry!.votedAt > 0 && Date.now() - positiveEntry!.votedAt >= THIRTY_DAYS_MS;

    if (positiveExpired) {
      // Window open — let the user update both sentiments
      setIsUpdateMode(true);
      setPositiveVotedAt(0);
      // Don't pre-fill votedIds so the grid looks fresh
      return;
    }

    if (hasPositive) {
      setPositiveVotedId(positiveEntry!.candidateId);
      setPositiveVotedAt(positiveEntry!.votedAt);
    }
    if (hasNegative) setNegativeVotedId(negativeEntry!.candidateId);

    if (hasPositive && hasNegative) {
      setStep("done");
    } else if (hasPositive && allowNegativeVote) {
      setStep("negative");
    } else if (hasPositive) {
      setStep("done");
    }
  }, [pollId, allowNegativeVote]);

  async function handleVote(candidate: Candidate, sentiment: VoteSentiment) {
    if (loadingId) return;

    // Prevent voting same candidate for both sentiments
    if (sentiment === "positive" && negativeVotedId === candidate.id) {
      pushToast({ tone: "error", title: "No permitido", description: "No puedes respaldar al candidato que rechazaste." });
      return;
    }
    if (sentiment === "negative" && positiveVotedId === candidate.id) {
      pushToast({ tone: "error", title: "No permitido", description: "No puedes rechazar al candidato que respaldaste." });
      return;
    }

    setLoadingId(candidate.id);
    setLoadingSentiment(sentiment);

    try {
      await submitVote({
        pollId,
        candidateId: candidate.id,
        sentiment,
        city: location.city,
        province: location.province,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (sentiment === "positive") {
        setPositiveVotedId(candidate.id);
      } else {
        setNegativeVotedId(candidate.id);
      }

      const nowTs = Date.now();
      saveVote(pollId, candidate.id, sentiment, nowTs);
      if (sentiment === "positive") setPositiveVotedAt(nowTs);
      if (isUpdateMode) setIsUpdateMode(false);

      pushToast({
        tone: "success",
        title: sentiment === "positive" ? "Respaldo registrado" : "Opinión registrada",
        description: sentiment === "positive"
          ? `Respaldaste a ${candidate.fullName}.`
          : `Registraste tu rechazo a ${candidate.fullName}.`,
      });

      // Advance step and scroll to top so the new indicator is visible
      if (sentiment === "positive" && allowNegativeVote) {
        setStep("negative");
      } else {
        setStep("done");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Intenta nuevamente.";
      const isAlready = msg.includes("Ya registramos");
      const isLocked = msg.includes("Podrás cambiarla");

      if (isAlready) {
        // Storage was cleared — recover state from Firebase signal
        if (sentiment === "positive") {
          setPositiveVotedId(candidate.id);
          saveVote(pollId, candidate.id, "positive");
          allowNegativeVote ? setStep("negative") : setStep("done");
        } else {
          setNegativeVotedId(candidate.id);
          saveVote(pollId, candidate.id, "negative");
          setStep("done");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (isLocked) {
        // Within the 30-day window — save to storage and lock the UI
        if (sentiment === "positive") {
          setPositiveVotedId(candidate.id);
          saveVote(pollId, candidate.id, "positive");
        } else {
          setNegativeVotedId(candidate.id);
          saveVote(pollId, candidate.id, "negative");
        }
        setStep("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      pushToast({
        tone: isAlready || isLocked ? "info" : "error",
        title: isAlready ? "Ya participaste" : isLocked ? "Opinión registrada" : "Algo salió mal",
        description: msg,
      });
    } finally {
      setLoadingId(null);
      setLoadingSentiment(null);
    }
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-medium text-white/60">No se han registrado candidatos</p>
        <p className="text-sm text-white/35">Vuelve pronto para participar.</p>
      </div>
    );
  }

  // All candidates declined — show them but no voting steps
  if (activeCandidates.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
          <p className="text-sm font-medium text-white/50">Todos los candidatos declinaron su candidatura</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="relative flex flex-col items-center gap-3 rounded-3xl border border-white/5 bg-white/[0.02] p-4 text-center opacity-50"
            >
              <div
                className="relative size-20 overflow-hidden rounded-2xl grayscale"
                style={{ backgroundColor: candidate.color }}
              >
                {candidate.photoUrl ? (
                  <Image
                    src={candidate.photoUrl}
                    alt={candidate.fullName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xl font-semibold text-white">
                    {initialsFromName(candidate.fullName)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white/60">{candidate.fullName}</p>
                <p className="truncate text-xs text-white/30">{candidate.party || "Sin casillero electoral"}</p>
              </div>
              <div className="w-full rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/40">
                Declinó su candidatura
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* Step indicator */}
      {step === "positive" && (
        <div className={`rounded-2xl border px-4 py-3 text-center ${isUpdateMode ? "border-sky-400/20 bg-sky-400/10" : "border-emerald-400/20 bg-emerald-400/10"}`}>
          <p className={`text-sm font-medium ${isUpdateMode ? "text-sky-300" : "text-emerald-300"}`}>
            {isUpdateMode ? "🔄 Actualiza tu respaldo" : "👍 ¿A quién respaldas?"}
          </p>
          <p className={`mt-1 text-[11px] leading-relaxed ${isUpdateMode ? "text-sky-300/60" : "text-emerald-300/60"}`}>
            {isUpdateMode
              ? "Han pasado 30 días — puedes cambiar tu opinión anterior."
              : "Indica el candidato que consideras la mejor opción para el cargo."}
          </p>
          {allowNegativeVote && (
            <p className={`mt-1.5 text-[11px] ${isUpdateMode ? "text-sky-300/40" : "text-emerald-300/40"}`}>Paso 1 de 2</p>
          )}
        </div>
      )}

      {step === "negative" && (
        <div className={`rounded-2xl border px-4 py-3 text-center ${isUpdateMode ? "border-sky-400/20 bg-sky-400/10" : "border-rose-400/20 bg-rose-400/10"}`}>
          <p className={`text-sm font-medium ${isUpdateMode ? "text-sky-300" : "text-rose-300"}`}>
            {isUpdateMode ? "🔄 Actualiza tu rechazo" : "👎 ¿A quién rechazas?"}
          </p>
          <p className={`mt-1 text-[11px] leading-relaxed ${isUpdateMode ? "text-sky-300/60" : "text-rose-300/60"}`}>
            {isUpdateMode
              ? "Han pasado 30 días — puedes cambiar tu opinión anterior."
              : "Señala el candidato que menos apoyarías para ocupar el cargo."}
          </p>
          <p className={`mt-1.5 text-[11px] ${isUpdateMode ? "text-sky-300/40" : "text-rose-300/40"}`}>
            {isUpdateMode ? "Paso 2 de 2 · Opcional" : "Paso 2 de 2 · Opcional"}
          </p>
        </div>
      )}

      {/* Thank you modal */}
      <VoteConfirmation
        open={step === "done"}
        pollSlug={pollSlug}
        isUpdate={isUpdateMode}
        canChangeAt={positiveVotedAt > 0 ? new Date(positiveVotedAt + THIRTY_DAYS_MS) : null}
      />

      {/* Candidate grid */}
      {step !== "done" && (
        <div className="grid grid-cols-2 gap-3">
          {candidates.map((candidate) => {
            // Inactive candidate — shown but not votable
            if (!candidate.isActive) {
              return (
                <div
                  key={candidate.id}
                  className="relative flex flex-col items-center gap-3 rounded-3xl border border-white/5 bg-white/[0.02] p-4 text-center opacity-50"
                >
                  {/* Photo — grayscale */}
                  <div
                    className="relative size-20 overflow-hidden rounded-2xl grayscale bg-white/10"
                  >
                    {candidate.photoUrl ? (
                      <Image
                        src={candidate.photoUrl}
                        alt={candidate.fullName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xl font-semibold text-white">
                        {initialsFromName(candidate.fullName)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/60">{candidate.fullName}</p>
                    <p className="truncate text-xs text-white/30">{candidate.party || "Sin casillero electoral"}</p>
                  </div>

                  {/* Declined badge */}
                  <div className="w-full rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/40">
                    Declinó su candidatura
                  </div>
                </div>
              );
            }

            const isPositiveVoted = positiveVotedId === candidate.id;
            const isNegativeVoted = negativeVotedId === candidate.id;
            const isLoading = loadingId === candidate.id;

            // In negative step, disable the candidate that was voted positive
            const isSameAsOtherVote = step === "negative" && positiveVotedId === candidate.id;
            const isDisabled = !!loadingId || isSameAsOtherVote;

            const isHighlighted = step === "positive" ? isPositiveVoted : isNegativeVoted;

            return (
              <div
                key={candidate.id}
                className={`group relative flex flex-col items-center gap-3 rounded-3xl border p-4 text-center transition-all ${
                  isHighlighted
                    ? step === "negative"
                      ? "border-rose-500/40 bg-rose-500/10 ring-2 ring-rose-500/20"
                      : "border-emerald-500/40 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                    : isSameAsOtherVote
                      ? "border-white/5 bg-white/[0.02] opacity-40"
                      : "border-white/8 bg-white/[0.04]"
                } ${isDisabled && !isHighlighted ? "opacity-40" : ""}`}
              >
                {/* Photo */}
                <div
                  className="relative size-20 overflow-hidden rounded-2xl bg-white/10"
                >
                  {candidate.photoUrl ? (
                    <Image
                      src={candidate.photoUrl}
                      alt={candidate.fullName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xl font-semibold text-white">
                      {initialsFromName(candidate.fullName)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{candidate.fullName}</p>
                  <p className="truncate text-xs text-white/40">{candidate.party || "Sin casillero electoral"}</p>
                </div>

                {/* Bio link */}
                {candidate.biography && (
                  <button
                    type="button"
                    onClick={() => setBioCandidate(candidate)}
                    className="text-[11px] font-medium text-white/40 underline underline-offset-2 hover:text-white/60"
                  >
                    Conocer trayectoria
                  </button>
                )}

                {/* Vote button */}
                <button
                  type="button"
                  onClick={() => void handleVote(candidate, step)}
                  disabled={isDisabled}
                  className={`w-full rounded-xl px-3 py-2 text-xs font-medium transition active:scale-[0.97] disabled:opacity-60 ${
                    isPositiveVoted && step === "negative"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isHighlighted
                        ? step === "negative"
                          ? "bg-rose-500 text-white"
                          : "bg-emerald-500 text-white"
                        : step === "negative"
                          ? "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                          : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  }`}
                >
                  {isLoading
                    ? "Registrando..."
                    : isPositiveVoted && step === "negative"
                      ? "Respaldado ✓"
                      : isHighlighted
                        ? step === "negative" ? "Rechazado ✓" : "Respaldado ✓"
                        : step === "negative"
                          ? "Rechazar"
                          : "Respaldar"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-auto flex flex-col items-center gap-3 pb-4 pt-6">
        {/* Skip negative step */}
        {step === "negative" && (
          <button
            type="button"
            onClick={() => setStep("done")}
            className="text-sm font-medium text-white/40 underline underline-offset-4 hover:text-white/60"
          >
            Omitir y ver resultados
          </button>
        )}

        {/* Propose candidate */}
        {step !== "done" && (
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="text-sm font-medium text-white/40 hover:text-white/60"
          >
            ¿No encuentras a tu candidato? <span className="underline underline-offset-4">Propónlo aquí</span>
          </button>
        )}

        {/* Link to results — visible during voting steps */}
        {step !== "done" && (
          <Link
            href={`/resultados/${pollSlug}`}
            className="text-sm font-medium text-white/50 underline underline-offset-4 hover:text-white/70"
          >
            Ver resultados en vivo
          </Link>
        )}

        <p className="text-center text-[11px] leading-relaxed text-white/20">
          Radar informativo · No reemplaza ningún proceso electoral oficial
        </p>
      </div>

      {/* Location permission explainer */}
      <LocationExplainer
        visible={geoStatus === "idle" && step !== "done"}
        onAllow={() => void requestGeo()}
        onDismiss={() => void dismissGeo()}
      />

      {/* Request candidate modal */}
      <RequestCandidateModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        pollId={pollId}
      />

      {/* Candidate bio modal */}
      <CandidateBioModal
        open={!!bioCandidate}
        candidate={bioCandidate}
        onClose={() => setBioCandidate(null)}
      />
    </div>
  );
}
