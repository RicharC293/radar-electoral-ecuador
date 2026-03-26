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
          className="mb-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-base leading-none">📍</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/80">
                  ¿Por qué pedimos tu ubicación?
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                  La usamos únicamente para mostrar de qué ciudad o provincia
                  provienen las opiniones. No compartimos tu ubicación con nadie
                  ni la almacenamos de forma identificable.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onAllow}
                    className="rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
                  >
                    Permitir ubicación
                  </button>
                  <button
                    type="button"
                    onClick={onDismiss}
                    className="px-2 py-1.5 text-xs text-white/35 transition hover:text-white/55"
                  >
                    Ahora no
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
