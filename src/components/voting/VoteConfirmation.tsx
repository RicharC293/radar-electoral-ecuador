"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function VoteConfirmation({
  open,
  pollSlug,
}: {
  open: boolean;
  pollSlug: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Decorative top gradient */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

            <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-8 text-center">
              {/* Icon */}
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-400/15 text-3xl">
                ✅
              </div>

              {/* Title */}
              <div>
                <h2 className="text-lg font-semibold text-white">
                  ¡Gracias por participar!
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                  Tu opinión fue registrada exitosamente. El radar se actualiza en tiempo real.
                </p>
              </div>

              {/* One-vote notice */}
              <div className="flex w-full items-start gap-2.5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.07] px-4 py-3 text-left">
                <span className="mt-px shrink-0 text-sm leading-none">🔒</span>
                <p className="text-xs leading-relaxed text-amber-200/70">
                  Solo se permite <strong className="font-semibold text-amber-200/90">una participación por persona</strong>. Tu voto ya fue registrado y no podrá modificarse.
                </p>
              </div>

              {/* CTA button */}
              <Link
                href={`/resultados/${pollSlug}`}
                className="mt-2 w-full rounded-2xl bg-emerald-500 px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-[0.98]"
              >
                Ver resultados en vivo →
              </Link>

              {/* Disclaimer */}
              <p className="text-[11px] leading-relaxed text-white/25">
                Radar informativo · No reemplaza ningún proceso electoral oficial
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
