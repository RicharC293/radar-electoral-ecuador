"use client";

import { useCallback, useState } from "react";

import { getBrowserGeolocation, getIPGeolocation, type GeoLocationSnapshot } from "@/lib/geolocation";

export type GeoPermissionStatus = "idle" | "requesting" | "done";

const fallback: GeoLocationSnapshot = {
  latitude: null,
  longitude: null,
  city: null,
  province: null,
  country: "EC",
};

/**
 * Lazy geolocation hook.
 *
 * - `status === "idle"`       → user hasn't decided yet (show LocationExplainer)
 * - `request()`               → user clicked "Permitir" → triggers browser GPS dialog
 *                               (GPS if granted, IP fallback if denied)
 * - `dismiss()`               → user clicked "Ahora no" → resolves via IP silently
 * - `status === "requesting"` → resolving in progress
 * - `status === "done"`       → location resolved (or failed), ready to use
 */
export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocationSnapshot>(fallback);
  const [status, setStatus] = useState<GeoPermissionStatus>("idle");

  const request = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("requesting");
    const result = await getBrowserGeolocation(); // shows browser dialog, falls back to IP
    setLocation(result);
    setStatus("done");
  }, [status]);

  const dismiss = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("requesting");
    const result = await getIPGeolocation(); // silent IP, no browser dialog
    setLocation(result);
    setStatus("done");
  }, [status]);

  return { location, status, request, dismiss };
}
