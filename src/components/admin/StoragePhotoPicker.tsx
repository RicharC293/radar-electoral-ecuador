"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { adminFetch } from "@/lib/admin-fetch";

interface StoragePhoto {
  path: string;
  url: string;
  size: number;
  created: string | null;
}

export function StoragePhotoPicker({
  open,
  onSelect,
  onClose,
}: {
  open: boolean;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [photos, setPhotos] = useState<StoragePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminFetch<{ photos: StoragePhoto[] }>("/api/admin/storage-photos");
      setPhotos(data.photos);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las fotos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void fetchPhotos();
    }
  }, [open, fetchPhotos]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#0f1117] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">Storage</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Fotos disponibles</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            Cerrar
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-white/60">Cargando fotos...</p>
        ) : error ? (
          <p className="py-8 text-center text-rose-300">{error}</p>
        ) : photos.length === 0 ? (
          <p className="py-8 text-center text-white/60">No hay fotos en el storage.</p>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
            {photos.map((photo) => (
              <button
                key={photo.path}
                type="button"
                onClick={() => {
                  onSelect(photo.url);
                  onClose();
                }}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/30 hover:ring-2 hover:ring-white/20"
              >
                <Image
                  src={photo.url}
                  alt={photo.path.split("/").pop() ?? "foto"}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="120px"
                />
              </button>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-white/30">
          {photos.length} {photos.length === 1 ? "foto" : "fotos"} en el storage
        </p>
      </div>
    </div>
  );
}
