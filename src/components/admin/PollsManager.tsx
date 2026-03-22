"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { adminFetch } from "@/lib/admin-fetch";
import { useAdminPolls } from "@/hooks/useAdminPolls";

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function PollsManager() {
  const { polls, loading, error, reload } = useAdminPolls();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const lockRef = useRef(false);

  function lock(key: string) {
    if (lockRef.current) return false;
    lockRef.current = true;
    setBusy(key);
    return true;
  }

  function unlock() {
    lockRef.current = false;
    setBusy(null);
  }

  async function createPoll(formData: FormData) {
    if (!lock("creating")) return;

    setMessage(null);

    try {
      await adminFetch("/api/admin/polls", {
        method: "POST",
        body: JSON.stringify({
          slug: String(formData.get("slug") ?? ""),
          title: String(formData.get("title") ?? ""),
          subtitle: String(formData.get("subtitle") ?? ""),
          electionType: String(formData.get("electionType") ?? "presidencia"),
          province: String(formData.get("province") ?? ""),
          status: String(formData.get("status") ?? "draft"),
          isPublic: formData.get("isPublic") === "on",
          allowNegativeVote: formData.get("allowNegativeVote") === "on"
        })
      });

      setMessage("Encuesta creada.");
      await reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo crear la encuesta.");
    } finally {
      unlock();
    }
  }

  async function togglePoll(pollId: string, nextValue: boolean) {
    if (!lock(`toggle-${pollId}`)) return;

    try {
      await adminFetch(`/api/admin/polls/${pollId}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublic: nextValue })
      });
      await reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo actualizar la encuesta.");
    } finally {
      unlock();
    }
  }

  async function toggleNegativeVote(pollId: string, nextValue: boolean) {
    if (!lock(`negative-${pollId}`)) return;

    try {
      await adminFetch(`/api/admin/polls/${pollId}`, {
        method: "PATCH",
        body: JSON.stringify({ allowNegativeVote: nextValue })
      });
      await reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo actualizar.");
    } finally {
      unlock();
    }
  }

  async function changeStatus(pollId: string, status: string) {
    if (!lock(`status-${pollId}`)) return;

    try {
      await adminFetch(`/api/admin/polls/${pollId}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo cambiar el estado.");
    } finally {
      unlock();
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form action={createPoll} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/45">Nueva encuesta</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Crear encuesta</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="slug" placeholder="Slug: demo-presidencia-ec" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
            <input name="title" placeholder="Titulo" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
            <input name="subtitle" placeholder="Subtitulo" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none md:col-span-2" />
            <select name="electionType" className="select-styled rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none">
              <option value="presidencia">Presidencia</option>
              <option value="prefectura">Prefectura</option>
              <option value="alcaldia">Alcaldia</option>
            </select>
            <select name="status" className="select-styled rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none">
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            <input name="province" placeholder="Provincia opcional" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none md:col-span-2" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" name="isPublic" className="size-4 rounded border-white/20 bg-transparent" />
              Pública desde el inicio
            </label>
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" name="allowNegativeVote" className="size-4 rounded border-white/20 bg-transparent" />
              Permitir opinión negativa
            </label>
          </div>
          <button type="submit" disabled={!!busy} className="rounded-full bg-white px-5 py-3 font-medium text-slate-950 disabled:opacity-60">
            {busy === "creating" ? "Creando..." : "Crear encuesta"}
          </button>
          {message ? <p className="text-sm text-white/70">{message}</p> : null}
        </form>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">Total</p>
            <p className="mt-3 text-4xl font-semibold text-white">{polls.length}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">Live</p>
            <p className="mt-3 text-4xl font-semibold text-white">
              {polls.filter((item) => item.status === "live").length}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">Publicas</p>
            <p className="mt-3 text-4xl font-semibold text-white">
              {polls.filter((item) => item.isPublic).length}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-white/5 shadow-glow">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-2xl font-semibold text-white">Encuestas existentes</h2>
        </div>
        {loading ? <p className="px-6 py-5 text-white/60">Cargando encuestas...</p> : null}
        {error ? <p className="px-6 py-5 text-rose-300">{error}</p> : null}
        <div className="divide-y divide-white/10">
          {polls.map((poll) => (
            <article key={poll.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:items-center">
              <div>
                <p className="text-lg font-semibold text-white">{poll.title}</p>
                <p className="text-sm text-white/55">
                  {poll.slug} · {poll.electionType} · {poll.province ?? "Nacional"}
                </p>
                <p className="mt-2 text-sm text-white/45">Actualizada: {formatDate(poll.updatedAt)}</p>
              </div>
              <div>
                <select
                  value={poll.status}
                  onChange={(event) => void changeStatus(poll.id, event.target.value)}
                  disabled={!!busy}
                  className="select-styled w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none disabled:opacity-60"
                >
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void togglePoll(poll.id, !poll.isPublic)}
                  disabled={!!busy}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {busy === `toggle-${poll.id}`
                    ? "Actualizando..."
                    : poll.isPublic
                      ? "Quitar pública"
                      : "Hacer pública"}
                </button>
                <button
                  type="button"
                  onClick={() => void toggleNegativeVote(poll.id, !poll.allowNegativeVote)}
                  disabled={!!busy}
                  className={`rounded-full border px-4 py-2 text-sm disabled:opacity-60 ${
                    poll.allowNegativeVote
                      ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
                      : "border-white/15 text-white/60"
                  }`}
                >
                  {busy === `negative-${poll.id}`
                    ? "Actualizando..."
                    : poll.allowNegativeVote
                      ? "Desactivar negativa"
                      : "Activar negativa"}
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/admin/candidatos?pollId=${poll.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950">
                  Gestionar candidatos
                </Link>
                <Link href={`/resultados/${poll.slug}`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white">
                  Ver resultados
                </Link>
              </div>
            </article>
          ))}
          {!loading && polls.length === 0 ? (
            <p className="px-6 py-5 text-white/60">Todavia no hay encuestas creadas.</p>
          ) : null}
        </div>
      </section>
    </section>
  );
}
