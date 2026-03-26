"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { httpsCallable } from "firebase/functions";
import { useState } from "react";

import { functions } from "@/lib/firebase/config";
import { registerVoteSchema } from "@/lib/validation/vote";
import type { RegisterVoteInput, RegisterVoteResult } from "@/types";

function normalizeVoteError(cause: unknown) {
  const message =
    cause && typeof cause === "object" && "message" in cause
      ? String(cause.message)
      : "No pudimos registrar tu opinión.";
  const code =
    cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";

  if (code.includes("already-exists")) {
    // New format includes a date: "Tu opinión ya fue registrada. Podrás cambiarla a partir del..."
    if (message.includes("Podrás cambiarla")) return message;
    return "Ya registramos tu opinión.";
  }

  if (code.includes("resource-exhausted") || message.includes("Demasiados intentos")) {
    return "Demasiados intentos desde esta conexión. Intenta más tarde.";
  }

  if (code.includes("failed-precondition")) {
    if (message.includes("Candidatura")) {
      return "Este candidato ya no está disponible.";
    }

    if (message.includes("Encuesta")) {
      return "El radar no está disponible en este momento.";
    }

    return "La participación no está disponible en este momento.";
  }

  if (code.includes("permission-denied")) {
    return "No pudimos validar tu participación.";
  }

  if (code.includes("not-found")) {
    return "Este radar ya no existe.";
  }

  if (code.includes("invalid-argument")) {
    return "No pudimos procesar tu opinión.";
  }

  if (message.includes("APP_SECRET")) {
    return "El sistema no está configurado correctamente.";
  }

  return "No pudimos registrar tu opinión.";
}

export function useVote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<RegisterVoteResult | null>(null);

  async function submitVote(input: Omit<RegisterVoteInput, "fingerprint"> & { sentiment?: string }) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const agent = await FingerprintJS.load();
      const result = await agent.get();
      const payload = registerVoteSchema.parse({
        ...input,
        fingerprint: result.visitorId
      });

      const callable = httpsCallable<typeof payload, RegisterVoteResult>(functions, "registerVote");
      const response = await callable(payload);

      setSuccess(response.data);
      return response.data;
    } catch (cause) {
      const message = normalizeVoteError(cause);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  return { submitVote, loading, error, success };
}
