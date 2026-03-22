"use client";

import { useState } from "react";

import { adminFetch } from "@/lib/admin-fetch";
import {
  useAdminCandidateRequests,
  type AdminCandidateRequest,
} from "@/hooks/useAdminCandidateRequests";
import { ApproveCandidateModal } from "./ApproveCandidateModal";

function statusClasses(status: "pending" | "approved" | "rejected") {
  if (status === "approved") {
    return "bg-emerald-400/15 text-emerald-200 ring-emerald-400/20";
  }

  if (status === "rejected") {
    return "bg-rose-400/15 text-rose-200 ring-rose-400/20";
  }

  return "bg-amber-400/15 text-amber-200 ring-amber-400/20";
}

function statusLabel(status: "pending" | "approved" | "rejected") {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CandidateRequestsPanel() {
  const { requests, loading, error, reload } = useAdminCandidateRequests();
  const [approveRequest, setApproveRequest] =
    useState<AdminCandidateRequest | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  async function handleReject(requestId: string) {
    if (!confirm("¿Seguro que deseas rechazar esta solicitud?")) return;

    setRejectingId(requestId);
    try {
      await adminFetch(`/api/admin/candidate-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected" }),
      });
      void reload();
    } catch {
      // silent
    } finally {
      setRejectingId(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white/65">
        Cargando solicitudes...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-rose-300">
        {error}
      </section>
    );
  }

  if (requests.length === 0) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white/65">
        No hay solicitudes registradas.
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-glow">
        {/* Header row — visible on md+ */}
        <div className="hidden md:grid md:grid-cols-[1.2fr_1fr_1fr_0.7fr_0.9fr_auto] gap-px bg-white/10">
          <div className="bg-slate-950/40 px-5 py-4 text-xs uppercase tracking-[0.2em] text-white/45">
            Candidato
          </div>
          <div className="bg-slate-950/40 px-5 py-4 text-xs uppercase tracking-[0.2em] text-white/45">
            Contacto
          </div>
          <div className="bg-slate-950/40 px-5 py-4 text-xs uppercase tracking-[0.2em] text-white/45">
            Notas
          </div>
          <div className="bg-slate-950/40 px-5 py-4 text-xs uppercase tracking-[0.2em] text-white/45">
            Estado
          </div>
          <div className="bg-slate-950/40 px-5 py-4 text-xs uppercase tracking-[0.2em] text-white/45">
            Fecha
          </div>
          <div className="bg-slate-950/40 px-5 py-4 text-xs uppercase tracking-[0.2em] text-white/45">
            Acciones
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {requests.map((request) => {
            const isPending = request.status === "pending";
            const isRejecting = rejectingId === request.id;

            return (
              <article
                key={request.id}
                className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-[1.2fr_1fr_1fr_0.7fr_0.9fr_auto] md:items-start"
              >
                <div>
                  <p className="font-medium text-white">
                    {request.candidateName}
                  </p>
                  <p className="text-sm text-white/55">
                    {request.candidateParty || "Sin partido"}
                  </p>
                  <p className="mt-2 text-sm text-white/45">
                    Solicita: {request.requesterName}
                  </p>
                </div>
                <div className="text-sm text-white/70">
                  {request.requesterContact}
                </div>
                <div className="text-sm text-white/70">
                  {request.notes || "Sin notas"}
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase ring-1 ${statusClasses(
                      request.status
                    )}`}
                  >
                    {statusLabel(request.status)}
                  </span>
                </div>
                <div className="text-sm text-white/55">
                  {formatDate(request.createdAt)}
                </div>
                <div className="flex items-start gap-2">
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setApproveRequest(request)}
                        className="rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20 transition hover:bg-emerald-500/25"
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReject(request.id)}
                        disabled={isRejecting}
                        className="rounded-xl bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-300 ring-1 ring-rose-500/20 transition hover:bg-rose-500/25 disabled:opacity-50"
                      >
                        {isRejecting ? "..." : "Rechazar"}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-white/30">—</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Approve modal */}
      <ApproveCandidateModal
        open={!!approveRequest}
        request={approveRequest}
        onClose={() => setApproveRequest(null)}
        onApproved={() => void reload()}
      />
    </>
  );
}
