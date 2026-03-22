"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { adminFetch } from "@/lib/admin-fetch";
import { useAdminPolls } from "@/hooks/useAdminPolls";
import { useAdminCandidates } from "@/hooks/useAdminCandidates";
import { StoragePhotoPicker } from "./StoragePhotoPicker";
import type { AdminCandidateRequest } from "@/hooks/useAdminCandidateRequests";

export function ApproveCandidateModal({
  open,
  request,
  onClose,
  onApproved,
}: {
  open: boolean;
  request: AdminCandidateRequest | null;
  onClose: () => void;
  onApproved: () => void;
}) {
  const { polls, loading: pollsLoading } = useAdminPolls(open);
  const [selectedPollId, setSelectedPollId] = useState("");
  const { candidates } = useAdminCandidates(selectedPollId || null);
  const [fullName, setFullName] = useState("");
  const [party, setParty] = useState("");
  const [color, setColor] = useState("#1D9E75");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photo state
  const [storagePhotoUrl, setStoragePhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form when request changes
  function handleEnter() {
    if (request) {
      setFullName(request.candidateName);
      setParty(request.candidateParty ?? "");
      setSelectedPollId(request.pollId ?? "");
      setColor("#1D9E75");
      setStoragePhotoUrl("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setError(null);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setStoragePhotoUrl("");
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleStorageSelect(url: string) {
    setStoragePhotoUrl(url);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function clearPhoto() {
    setStoragePhotoUrl("");
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const hasPhoto = !!storagePhotoUrl || !!photoFile;
  const previewSrc = storagePhotoUrl || photoPreview;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedPollId) {
      setError("Selecciona una encuesta.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // sortOrder = next in line based on existing candidates
      const nextOrder = candidates.length + 1;

      // 1. Create the candidate
      const result = await adminFetch<{ success: true; id: string }>(
        `/api/admin/polls/${selectedPollId}/candidates`,
        {
          method: "POST",
          body: JSON.stringify({
            fullName: fullName.trim(),
            party: party.trim() || "",
            photoUrl: storagePhotoUrl || "",
            color,
            sortOrder: nextOrder,
            isActive: true,
          }),
        }
      );

      // 2. Upload photo file if selected
      if (photoFile && result.id) {
        const uploadData = new FormData();
        uploadData.set("file", photoFile);
        await adminFetch(
          `/api/admin/polls/${selectedPollId}/candidates/${result.id}/photo`,
          { method: "POST", body: uploadData }
        );
      }

      // 3. Mark request as approved
      await adminFetch(`/api/admin/candidate-requests/${request!.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      });

      onApproved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error al aprobar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && request ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-slate-900 shadow-2xl sm:rounded-3xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              onAnimationComplete={() => handleEnter()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="text-base font-semibold text-white">Aprobar candidato</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-8 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white/70"
                >
                  ✕
                </button>
              </div>

              {/* Request info */}
              <div className="border-b border-white/10 bg-white/[0.03] px-5 py-3">
                <p className="text-xs text-white/40">
                  Solicitud de{" "}
                  <span className="text-white/60">{request.requesterName}</span>
                </p>
                {request.notes && (
                  <p className="mt-1 text-xs text-white/35">Notas: {request.notes}</p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 px-5 pb-6 pt-4">
                {/* Poll selector */}
                <div>
                  <label className="mb-1 block text-xs text-white/40">Encuesta</label>
                  {pollsLoading ? (
                    <p className="text-sm text-white/40">Cargando encuestas...</p>
                  ) : (
                    <select
                      value={selectedPollId}
                      onChange={(e) => setSelectedPollId(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                    >
                      <option value="">Seleccionar encuesta</option>
                      {polls.map((poll) => (
                        <option key={poll.id} value={poll.id}>
                          {poll.title} ({poll.status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Candidate name */}
                <div>
                  <label className="mb-1 block text-xs text-white/40">Nombre completo</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                  />
                </div>

                {/* Party */}
                <div>
                  <label className="mb-1 block text-xs text-white/40">Partido (opcional)</label>
                  <input
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    placeholder="Sin casillero electoral"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                  />
                </div>

                {/* Photo */}
                <div>
                  <label className="mb-1 block text-xs text-white/40">Foto del candidato</label>
                  {hasPhoto && previewSrc ? (
                    <div className="flex items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        <Image
                          src={previewSrc}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <p className="flex-1 truncate text-xs text-white/30">
                        {storagePhotoUrl ? "Foto del storage" : photoFile?.name}
                      </p>
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="text-xs text-white/45 hover:text-white"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPicker(true)}
                        className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
                      >
                        Elegir del storage
                      </button>
                      <label className="cursor-pointer rounded-full border border-dashed border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5">
                        Subir nueva
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Color */}
                <div>
                  <label className="mb-1 block text-xs text-white/40">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="size-10 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    />
                    <input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      pattern="^#([0-9A-Fa-f]{6})$"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                    />
                  </div>
                </div>

                {/* Auto order info */}
                {selectedPollId && (
                  <p className="text-xs text-white/30">
                    Se asignará automáticamente la posición #{candidates.length + 1}
                  </p>
                )}

                {/* Error */}
                {error && (
                  <p className="rounded-xl bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? "Creando candidato..." : "Aprobar y crear candidato"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Storage photo picker */}
      <StoragePhotoPicker
        open={showPicker}
        onSelect={(url) => {
          handleStorageSelect(url);
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
      />
    </>
  );
}
