"use client";

import { useEffect, useState } from "react";

import { adminFetch } from "@/lib/admin-fetch";

export interface AdminPoll {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  electionType: "presidencia" | "prefectura" | "alcaldia";
  province: string | null;
  status: "draft" | "live" | "paused" | "closed" | "archived";
  isPublic: boolean;
  allowNegativeVote: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export function useAdminPolls(enabled = true) {
  const [polls, setPolls] = useState<AdminPoll[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await adminFetch<{ polls: AdminPoll[] }>("/api/admin/polls");
      setPolls(payload.polls);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las encuestas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [enabled]);

  return { polls, loading, error, reload };
}
