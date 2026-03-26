"use client";

import { motion, AnimatePresence } from "framer-motion";

export function LocationExplainer({
  visible,
  onAllow,
  onDismiss,
}: {
  visible: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <motion.div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-500" />

            <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-7 text-center">
              {/* Icon */}
              <div className="flex size-14 items-center justify-center rounded-full bg-blue-400/10 text-2xl">
                📍
              </div>

              {/* Text */}
              <div>
                <h2 className="text-base font-semibold text-white">
                  ¿Por qué pedimos tu ubicación?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  La usamos únicamente para mostrar de qué ciudad o provincia
                  provienen las opiniones. No compartimos tu ubicación con
                  nadie ni la almacenamos de forma identificable.
                </p>
              </div>

              {/* Actions */}
              <div className="flex w-full flex-col gap-2">
                <button
                  type="button"
                  onClick={onAllow}
                  className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90 active:scale-[0.98]"
                >
                  Permitir ubicación
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="w-full rounded-2xl py-2.5 text-sm text-white/40 transition hover:text-white/60"
                >
                  Ahora no
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
