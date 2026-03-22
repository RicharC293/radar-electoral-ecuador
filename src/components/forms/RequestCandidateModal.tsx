"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { db } from "@/lib/firebase/config";

export function RequestCandidateModal({
  open,
  onClose,
  pollId,
}: {
  open: boolean;
  onClose: () => void;
  pollId: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);

    try {
      await addDoc(collection(db, "candidateRequests"), {
        pollId,
        requesterName: String(formData.get("requesterName") ?? ""),
        requesterContact: String(formData.get("requesterContact") ?? ""),
        candidateName: String(formData.get("candidateName") ?? ""),
        candidateParty: String(formData.get("candidateParty") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSent(true);
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset after animation
    setTimeout(() => setSent(false), 300);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-slate-900 shadow-2xl sm:rounded-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-base font-semibold text-white">Proponer candidato</h2>
              <button
                type="button"
                onClick={handleClose}
                className="grid size-8 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white/70"
              >
                ✕
              </button>
            </div>

            {sent ? (
              /* Success state */
              <div className="flex flex-col items-center gap-3 px-5 pb-6 pt-8 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">
                  ✅
                </div>
                <h3 className="text-base font-semibold text-white">Propuesta enviada</h3>
                <p className="text-sm text-white/50">
                  Revisaremos tu propuesta y te notificaremos si es aprobada.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-2 w-full rounded-2xl bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              /* Form */
              <form action={handleSubmit} className="space-y-3 px-5 pb-6 pt-4">
                <p className="text-xs text-white/40">
                  ¿No encuentras a tu candidato? Llena este formulario y lo revisaremos.
                </p>

                <input
                  name="requesterName"
                  placeholder="Tu nombre"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                />
                <input
                  name="requesterContact"
                  placeholder="Correo o WhatsApp"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                />
                <input
                  name="candidateName"
                  placeholder="Nombre del candidato"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                />
                <input
                  name="candidateParty"
                  placeholder="Partido o movimiento (opcional)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                />
                <textarea
                  name="notes"
                  placeholder="Notas adicionales (opcional)"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? "Enviando..." : "Enviar propuesta"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
