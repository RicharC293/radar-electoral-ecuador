"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { initialsFromName } from "@/lib/utils";
import type { Candidate } from "@/types";

export function CandidateBioModal({
  open,
  candidate,
  onClose,
}: {
  open: boolean;
  candidate: Candidate | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && candidate ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[85dvh] w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Color bar */}
            <div className="h-1.5 w-full" style={{ backgroundColor: candidate.color }} />

            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/10 px-5 py-4">
              <div
                className="relative size-14 shrink-0 overflow-hidden rounded-2xl"
                style={{ backgroundColor: candidate.color }}
              >
                {candidate.photoUrl ? (
                  <Image
                    src={candidate.photoUrl}
                    alt={candidate.fullName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-lg font-semibold text-white">
                    {initialsFromName(candidate.fullName)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold text-white">
                  {candidate.fullName}
                </h2>
                <p className="text-sm text-white/45">
                  {candidate.party || "Sin casillero electoral"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-8 shrink-0 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white/70"
              >
                ✕
              </button>
            </div>

            {/* Biography content */}
            <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: "60dvh" }}>
              {candidate.biography ? (
                <div
                  className="prose prose-invert prose-sm max-w-none text-white/70 prose-headings:text-white prose-strong:text-white prose-a:text-emerald-400"
                  dangerouslySetInnerHTML={{ __html: candidate.biography }}
                />
              ) : (
                <p className="text-center text-sm text-white/35">
                  No se ha registrado información sobre la trayectoria de este candidato.
                </p>
              )}
            </div>

            {/* Close button */}
            <div className="border-t border-white/10 px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
