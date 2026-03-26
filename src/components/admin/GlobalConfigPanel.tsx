"use client";

import { useState } from "react";

import { adminFetch } from "@/lib/admin-fetch";
import { useGlobalConfig } from "@/hooks/useGlobalConfig";

export function GlobalConfigPanel() {
  const { config, loading } = useGlobalConfig();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggleElectionMode() {
    setSaving(true);
    setMessage(null);
    try {
      const next = !config.electionModeActive;
      await adminFetch("/api/admin/config", {
        method: "PATCH",
        body: JSON.stringify({ electionModeActive: next }),
      });
      setMessage(next ? "Modo Elecciones activado." : "Modo Elecciones desactivado.");
    } catch {
      setMessage("No se pudo actualizar la configuración.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow">
        <p className="text-sm uppercase tracking-[0.3em] text-white/45">Global</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Configuración general</h2>
        <p className="mt-1 text-sm text-white/40">Ajustes que aplican a todas las encuestas activas.</p>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/45">Votación</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Modo Elecciones</h3>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-xl ${config.electionModeActive ? "bg-amber-400/15" : "bg-white/5"}`}>
              🗳️
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">Permitir cambio de voto único</p>
              <p className="mt-1 text-sm leading-relaxed text-white/45">
                Cuando está activo, cada ciudadano que ya votó puede cambiar su opinión <strong className="text-white/70">una sola vez</strong>, ignorando el período de 30 días. Ideal para los últimos días antes de las elecciones.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-white/40">Cargando estado...</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${config.electionModeActive ? "bg-amber-400/15 text-amber-300" : "bg-white/5 text-white/40"}`}>
                <span className={`size-1.5 rounded-full ${config.electionModeActive ? "bg-amber-400" : "bg-white/20"}`} />
                {config.electionModeActive ? "Activo" : "Inactivo"}
              </div>
              <button
                type="button"
                onClick={() => void toggleElectionMode()}
                disabled={saving}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
                  config.electionModeActive
                    ? "border border-rose-400/25 text-rose-300 hover:bg-rose-400/10"
                    : "bg-amber-400 text-slate-950 hover:bg-amber-300"
                }`}
              >
                {saving
                  ? "Guardando..."
                  : config.electionModeActive
                    ? "Desactivar Modo Elecciones"
                    : "Activar Modo Elecciones"}
              </button>
            </div>
          )}
        </div>

        {message && (
          <p className="text-sm text-white/60">{message}</p>
        )}

        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] px-4 py-3">
          <p className="text-xs leading-relaxed text-amber-200/60">
            <strong className="text-amber-200/80">⚠️ Atención:</strong> Al activar este modo, todos los votantes registrados podrán cambiar su opinión una vez. Al desactivarlo, vuelven a aplicar las restricciones normales de 30 días. El cambio ya usado <strong className="text-amber-200/80">no se revierte</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
