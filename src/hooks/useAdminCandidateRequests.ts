"use client";

import { useEffect, useState } from "react";

import { adminFetch } from "@/lib/admin-fetch";

export interface AdminCandidateRequest {
  id: string;
  pollId: string | null;
  requesterName: string;
  requesterContact: string;
  candidateName: string;
  candidateParty: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string | null;
}

export function useAdminCandidateRequests() {
  const [requests, setRequests] = useState<AdminCandidateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);

    try {
      const payload = await adminFetch<{ requests: AdminCandidateRequest[] }>(
        "/api/admin/candidate-requests"
      );
      setRequests(payload.requests);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  return { requests, loading, error, reload };
}
