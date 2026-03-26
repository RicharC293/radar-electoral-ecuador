"use client";

import { useFeaturedPoll } from "@/hooks/useFeaturedPoll";
import { useRealtimePollData } from "@/hooks/useRealtimePollData";
import { PulseDot } from "@/components/ui/PulseDot";
import { VoteTicker } from "@/components/results/VoteTicker";
import { ImmersivePodium } from "@/components/results/ImmersivePodium";
import { ImmersiveRanking } from "@/components/results/ImmersiveRanking";
import { ImmersiveStats } from "@/components/results/ImmersiveStats";
import { PhysicsConfetti } from "@/components/results/PhysicsConfetti";
import type { Poll } from "@/types";

function LiveContent({ poll }: { poll: Poll }) {
  const { ranked, lastChange } = useRealtimePollData(poll.id);
  const candidateColors = ranked.map((r) => r.color);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f1117] px-4 py-8 md:px-8 md:py-10">
      <PhysicsConfetti trigger={lastChange} candidateColors={candidateColors} />

      {/* Header */}
      <header className="mb-8 text-center">
        <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-white/35">
          Radar Electoral en Vivo
        </p>
        <h1 className="mb-3 text-[22px] font-medium text-white md:text-[24px]">{poll.title}</h1>
        <div className="inline-flex items-center gap-2">
          <PulseDot />
          <span className="text-sm text-white/50">Actualización en tiempo real</span>
        </div>
      </header>

      {/* Stats pills */}
      <div className="mb-8">
        <ImmersiveStats poll={poll} />
      </div>

      {/* Podium */}
      <div className="mb-10">
        {ranked.length > 0 ? (
          <ImmersivePodium results={ranked} />
        ) : (
          <div className="py-16 text-center">
            <p className="text-white/20">Sin datos aún — esperando participación...</p>
          </div>
        )}
      </div>

      {/* Ranking completo */}
      {ranked.length > 0 && (
        <div className="mx-auto mb-8 max-w-2xl">
          <ImmersiveRanking results={ranked} lastChange={lastChange} />
        </div>
      )}


      {/* Footer */}
      <footer className="text-center text-[11px] text-white/20">
        Sondeo ciudadano informativo · Sin validez electoral
      </footer>
    </div>
  );
}

export function ImmersiveLiveView() {
  const { poll, loading } = useFeaturedPoll();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <div className="flex items-center gap-3 text-white/40">
          <span className="animate-pulseSoft text-lg">●</span>
          <span className="text-sm">Cargando información...</span>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0f1117] text-center">
        <p className="text-lg font-medium text-white/60">Sin radar activo</p>
        <p className="text-sm text-white/30">
          No hay un radar disponible en este momento.
        </p>
      </div>
    );
  }

  return <LiveContent poll={poll} />;
}
