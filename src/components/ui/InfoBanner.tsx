"use client";

import { useState } from "react";

import { RequestCandidateModal } from "@/components/forms/RequestCandidateModal";

export function InfoBanner({ pollId }: { pollId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-base leading-none">📡</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white/75">
              Sondeo ciudadano informativo
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/40">
              Refleja la opinión pública. No reemplaza ningún proceso electoral oficial.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-2 flex items-start gap-1.5 text-left text-xs font-medium text-emerald-400/80 transition-colors hover:text-emerald-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-px shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>¿Tu ciudad o provincia no está aquí? Propón candidatos</span>
            </button>
          </div>
        </div>
      </div>

      <RequestCandidateModal
        open={open}
        onClose={() => setOpen(false)}
        pollId={pollId}
      />
    </>
  );
}
