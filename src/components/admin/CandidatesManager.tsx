"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { adminFetch } from "@/lib/admin-fetch";
import { useAdminCandidates } from "@/hooks/useAdminCandidates";
import { useAdminPolls } from "@/hooks/useAdminPolls";
import { ColorPalette } from "./ColorPalette";
import { StoragePhotoPicker } from "./StoragePhotoPicker";
import type { AdminCandidate } from "@/hooks/useAdminCandidates";

export function CandidatesManager() {
  const searchParams = useSearchParams();
  const initialPollId = searchParams.get("pollId");
  const { polls, loading: pollsLoading } = useAdminPolls();
  const [selectedPollId, setSelectedPollId] = useState<string | null>(initialPollId);
  const { candidates, loading, error, reload } = useAdminCandidates(selectedPollId);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  const [createPhotoUrl, setCreatePhotoUrl] = useState<string>("");
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

  async function createCandidate(formData: FormData) {
    if (!selectedPollId) {
      setMessage("Selecciona una encuesta.");
      return;
    }
    if (!lock("creating")) return;
    setMessage(null);

    try {
      const photoFile = formData.get("photoFile");

      const response = await adminFetch<{ success: true; id: string }>(
        `/api/admin/polls/${selectedPollId}/candidates`,
        {
          method: "POST",
          body: JSON.stringify({
            fullName: String(formData.get("fullName") ?? ""),
            party: String(formData.get("party") ?? ""),
            photoUrl: createPhotoUrl || String(formData.get("photoUrl") ?? ""),
            color: String(formData.get("color") ?? "#1D9E75"),
            sortOrder: Number(formData.get("sortOrder") ?? 1),
            biography: String(formData.get("biography") ?? ""),
            isActive: formData.get("isActive") === "on"
          })
        }
      );

      if (photoFile instanceof File && photoFile.size > 0) {
        const uploadData = new FormData();
        uploadData.set("file", photoFile);
        await adminFetch(`/api/admin/polls/${selectedPollId}/candidates/${response.id}/photo`, {
          method: "POST",
          body: uploadData
        });
      }

      setMessage("Candidato creado.");
      setCreatePhotoUrl("");
      await reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo crear el candidato.");
    } finally {
      unlock();
    }
  }

  async function updateCandidate(candidateId: string, formData: FormData) {
    if (!selectedPollId || !lock(`edit-${candidateId}`)) return;

    setMessage(null);

    try {
      const photoFile = formData.get("photoFile");
      const storagePhotoUrl = String(formData.get("storagePhotoUrl") ?? "");

      const patchBody: Record<string, unknown> = {
        fullName: String(formData.get("fullName") ?? ""),
        party: String(formData.get("party") ?? ""),
        color: String(formData.get("color") ?? "#1D9E75"),
        sortOrder: Number(formData.get("sortOrder") ?? 1),
        biography: String(formData.get("biography") ?? ""),
      };

      if (storagePhotoUrl) {
        patchBody.photoUrl = storagePhotoUrl;
      }

      await adminFetch(`/api/admin/polls/${selectedPollId}/candidates/${candidateId}`, {
        method: "PATCH",
        body: JSON.stringify(patchBody)
      });

      if (!storagePhotoUrl && photoFile instanceof File && photoFile.size > 0) {
        const uploadData = new FormData();
        uploadData.set("file", photoFile);
        await adminFetch(`/api/admin/polls/${selectedPollId}/candidates/${candidateId}/photo`, {
          method: "POST",
          body: uploadData
        });
      }

      setMessage("Candidato actualizado.");
      setEditingId(null);
      await reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo actualizar el candidato.");
    } finally {
      unlock();
    }
  }

  async function toggleCandidate(candidateId: string, nextValue: boolean) {
    if (!selectedPollId || !lock(`toggle-${candidateId}`)) return;
    try {
      await adminFetch(`/api/admin/polls/${selectedPollId}/candidates/${candidateId}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextValue })
      });
      await reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo actualizar el candidato.");
    } finally {
      unlock();
    }
  }

  async function uploadCandidatePhoto(candidateId: string, file: File) {
    if (!selectedPollId || !lock(`photo-${candidateId}`)) return;

    setMessage(null);

    try {
      const uploadData = new FormData();
      uploadData.set("file", file);
      await adminFetch(`/api/admin/polls/${selectedPollId}/candidates/${candidateId}/photo`, {
        method: "POST",
        body: uploadData
      });
      setMessage("Foto actualizada.");
      await reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo subir la foto.");
    } finally {
      unlock();
    }
  }

  async function deleteCandidate(candidateId: string) {
    if (!selectedPollId || lockRef.current) return;

    const confirmed = window.confirm(
      "Esto eliminara el candidato de forma permanente. Solo funciona si no tiene votos. Deseas continuar?"
    );
    if (!confirmed) return;

    if (!lock(`delete-${candidateId}`)) return;
    setMessage(null);

    try {
      await adminFetch(`/api/admin/polls/${selectedPollId}/candidates/${candidateId}`, {
        method: "DELETE"
      });
      setMessage("Candidato eliminado.");
      await reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo eliminar el candidato.");
    } finally {
      unlock();
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow">
        <p className="text-sm uppercase tracking-[0.3em] text-white/45">Encuesta</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <select
            value={selectedPollId ?? ""}
            onChange={(event) => setSelectedPollId(event.target.value || null)}
            className="select-styled w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none"
          >
            <option value="">Selecciona una encuesta</option>
            {polls.map((poll) => (
              <option key={poll.id} value={poll.id}>
                {poll.title}
              </option>
            ))}
          </select>
          {pollsLoading ? <span className="text-sm text-white/55">Cargando encuestas...</span> : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form action={createCandidate} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/45">Nuevo candidato</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Crear candidatura</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="fullName" placeholder="Nombre completo" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none md:col-span-2" />
            <input name="party" placeholder="Partido (opcional)" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
            <input name="sortOrder" type="number" min={1} defaultValue={candidates.length + 1 || 1} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
            <ColorPalette name="color" />
            <PhotoField
              photoUrl={createPhotoUrl}
              onPickerOpen={() => setPickerTarget("create")}
              onClear={() => setCreatePhotoUrl("")}
              fileInputName="photoFile"
            />
            <div className="md:col-span-2">
              <p className="mb-1 text-sm text-white/45">Trayectoria (HTML, opcional)</p>
              <textarea
                name="biography"
                placeholder="<p>Información sobre la trayectoria del candidato...</p>"
                rows={4}
                className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 font-mono text-sm text-white outline-none"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm text-white/70">
            <input type="checkbox" name="isActive" defaultChecked className="size-4 rounded border-white/20 bg-transparent" />
            Candidato activo
          </label>
          <button type="submit" disabled={!!busy || !selectedPollId} className="rounded-full bg-white px-5 py-3 font-medium text-slate-950 disabled:opacity-60">
            {busy === "creating" ? "Creando..." : "Crear candidato"}
          </button>
          {message ? <p className="text-sm text-white/70">{message}</p> : null}
        </form>

        <section className="rounded-[28px] border border-white/10 bg-white/5 shadow-glow">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-semibold text-white">Candidatos cargados</h2>
          </div>
          {!selectedPollId ? <p className="px-6 py-5 text-white/60">Selecciona una encuesta para ver sus candidatos.</p> : null}
          {loading ? <p className="px-6 py-5 text-white/60">Cargando candidatos...</p> : null}
          {error ? <p className="px-6 py-5 text-rose-300">{error}</p> : null}
          <div className="divide-y divide-white/10">
            {candidates.map((candidate) => (
              <article key={candidate.id} className="px-6 py-5">
                {editingId === candidate.id ? (
                  <EditCandidateForm
                    candidate={candidate}
                    busy={busy}
                    onSave={(formData) => void updateCandidate(candidate.id, formData)}
                    onCancel={() => setEditingId(null)}
                    onPickerOpen={() => setPickerTarget(`edit-${candidate.id}`)}
                  />
                ) : (
                  <CandidateRow
                    candidate={candidate}
                    busy={busy}
                    onEdit={() => setEditingId(candidate.id)}
                    onToggle={() => void toggleCandidate(candidate.id, !candidate.isActive)}
                    onUploadPhoto={(file) => void uploadCandidatePhoto(candidate.id, file)}
                    onDelete={() => void deleteCandidate(candidate.id)}
                  />
                )}
              </article>
            ))}
            {selectedPollId && !loading && candidates.length === 0 ? (
              <p className="px-6 py-5 text-white/60">Aun no hay candidatos para esta encuesta.</p>
            ) : null}
          </div>
        </section>
      </div>

      <StoragePhotoPicker
        open={pickerTarget !== null}
        onSelect={(url) => {
          if (pickerTarget === "create") {
            setCreatePhotoUrl(url);
          } else if (pickerTarget?.startsWith("edit-")) {
            // The edit form handles its own state via the ref callback
            const event = new CustomEvent("storage-photo-selected", { detail: url });
            window.dispatchEvent(event);
          }
          setPickerTarget(null);
        }}
        onClose={() => setPickerTarget(null)}
      />
    </section>
  );
}

/* ── Photo field (shared) ── */

function PhotoField({
  photoUrl,
  onPickerOpen,
  onClear,
  fileInputName,
}: {
  photoUrl: string;
  onPickerOpen: () => void;
  onClear: () => void;
  fileInputName: string;
}) {
  return (
    <div className="space-y-3 md:col-span-2">
      <p className="text-sm text-white/45">Foto del candidato</p>
      {photoUrl ? (
        <div className="flex items-center gap-3">
          <div className="relative size-14 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <Image src={photoUrl} alt="Preview" fill className="object-cover" sizes="56px" />
          </div>
          <p className="flex-1 truncate text-xs text-white/30">Foto del storage seleccionada</p>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-white/45 hover:text-white"
          >
            Quitar
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPickerOpen}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            Elegir del storage
          </button>
          <label className="cursor-pointer rounded-full border border-dashed border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5">
            Subir nueva
            <input
              name={fileInputName}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}

/* ── Candidate row (view mode) ── */

function CandidateRow({
  candidate,
  busy,
  onEdit,
  onToggle,
  onUploadPhoto,
  onDelete,
}: {
  candidate: AdminCandidate;
  busy: string | null;
  onEdit: () => void;
  onToggle: () => void;
  onUploadPhoto: (file: File) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.9fr] lg:items-center">
      <div className="flex items-center gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {candidate.photoUrl ? (
            <Image
              src={candidate.photoUrl}
              alt={candidate.fullName}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[10px] uppercase text-white/45">
              Sin foto
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex size-4 shrink-0 rounded-full" style={{ backgroundColor: candidate.color }} />
            <p className="text-lg font-semibold text-white">{candidate.fullName}</p>
          </div>
          <p className="mt-1 text-sm text-white/55">{candidate.party || "Sin casillero electoral"}</p>
          <p className="mt-1 text-xs text-white/35">
            Orden: {candidate.sortOrder} · {candidate.totalVotes} votos · {candidate.percentage}%
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={!!busy}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onToggle}
          disabled={!!busy}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {busy === `toggle-${candidate.id}`
            ? "Actualizando..."
            : candidate.isActive
              ? "Desactivar"
              : "Activar"}
        </button>
        <label className={`rounded-full border border-white/15 px-4 py-2 text-center text-sm text-white ${busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
          {busy === `photo-${candidate.id}` ? "Subiendo..." : "Cambiar foto"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={!!busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUploadPhoto(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDelete}
          disabled={!!busy}
          className="rounded-full border border-rose-400/25 px-4 py-2 text-sm text-rose-200 disabled:opacity-60"
        >
          {busy === `delete-${candidate.id}` ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
}

/* ── Candidate edit form (inline) ── */

function EditCandidateForm({
  candidate,
  busy,
  onSave,
  onCancel,
  onPickerOpen,
}: {
  candidate: AdminCandidate;
  busy: string | null;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
  onPickerOpen: () => void;
}) {
  const isSaving = busy === `edit-${candidate.id}`;
  const inputClass = "w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none";
  const [editPhotoUrl, setEditPhotoUrl] = useState(candidate.photoUrl || "");

  useEffect(() => {
    function handleStoragePhoto(e: Event) {
      const url = (e as CustomEvent<string>).detail;
      setEditPhotoUrl(url);
    }
    window.addEventListener("storage-photo-selected", handleStoragePhoto);
    return () => window.removeEventListener("storage-photo-selected", handleStoragePhoto);
  }, []);

  function handleSave(formData: FormData) {
    if (editPhotoUrl && editPhotoUrl !== candidate.photoUrl) {
      formData.set("storagePhotoUrl", editPhotoUrl);
    }
    onSave(formData);
  }

  return (
    <form
      action={handleSave}
      className="space-y-4 rounded-[20px] border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-white/45">Editando candidato</p>
        <button
          type="button"
          onClick={onCancel}
          disabled={!!busy}
          className="text-sm text-white/45 hover:text-white disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="fullName"
          defaultValue={candidate.fullName}
          placeholder="Nombre completo"
          className={`${inputClass} md:col-span-2`}
        />
        <input
          name="party"
          defaultValue={candidate.party}
          placeholder="Partido"
          className={inputClass}
        />
        <input
          name="sortOrder"
          type="number"
          min={1}
          defaultValue={candidate.sortOrder}
          className={inputClass}
        />
        <ColorPalette name="color" defaultValue={candidate.color} />
        <PhotoField
          photoUrl={editPhotoUrl}
          onPickerOpen={onPickerOpen}
          onClear={() => setEditPhotoUrl("")}
          fileInputName="photoFile"
        />
        <div className="md:col-span-2">
          <p className="mb-1 text-sm text-white/45">Trayectoria (HTML)</p>
          <textarea
            name="biography"
            defaultValue={candidate.biography ?? ""}
            placeholder="<p>Información sobre la trayectoria del candidato...</p>"
            rows={4}
            className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 font-mono text-sm text-white outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!!busy}
          className="rounded-full bg-white px-5 py-3 font-medium text-slate-950 disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={!!busy}
          className="rounded-full border border-white/15 px-5 py-3 text-sm text-white disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
