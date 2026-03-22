"use client";

import { useEffect, useState } from "react";

import { adminFetch } from "@/lib/admin-fetch";

export interface AdminCandidate {
  id: string;
  fullName: string;
  party: string;
  photoUrl: string;
  color: string;
  sortOrder: number;
  biography: string;
  isActive: boolean;
  createdAt: string | null;
  totalVotes: number;
  percentage: number;
  positiveVotes: number;
  negativeVotes: number;
  positivePercentage: number;
  negativePercentage: number;
  lastVoteAt: string | null;
}

export function useAdminCandidates(pollId: string | null) {
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [loading, setLoading] = useState(Boolean(pollId));
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    if (!pollId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await adminFetch<{ candidates: AdminCandidate[] }>(
        `/api/admin/polls/${pollId}/candidates`
      );
      setCandidates(payload.candidates);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar los candidatos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [pollId]);

  return { candidates, loading, error, reload };
}
