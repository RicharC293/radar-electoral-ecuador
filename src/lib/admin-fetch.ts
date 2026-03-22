"use client";

import { auth } from "@/lib/firebase/config";

export async function adminFetch<T>(input: string, init: RequestInit = {}) {
  const explicitAuthorization =
    init.headers && typeof Headers !== "undefined"
      ? new Headers(init.headers).get("authorization")
      : null;
  const user = auth.currentUser;
  const token = explicitAuthorization
    ? null
    : user
      ? await user.getIdToken()
      : null;

  if (!explicitAuthorization && !token) {
    throw new Error("No admin session found.");
  }

  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  const response = await fetch(input, {
    ...init,
    headers: {
      ...(!isFormData ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {})
    }
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Admin request failed.");
  }

  return payload;
}
