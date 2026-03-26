"use client";

import { useCallback, useState } from "react";

import { getBrowserGeolocation, type GeoLocationSnapshot } from "@/lib/geolocation";

export type GeoPermissionStatus = "idle" | "requesting" | "granted" | "denied";

const fallback: GeoLocationSnapshot = {
  latitude: null,
  longitude: null,
  city: null,
  province: null,
  country: "EC",
};

/**
 * Lazy geolocation hook — does NOT auto-request on mount.
 * Call `request()` to trigger the browser permission dialog,
 * or `dismiss()` to skip location without requesting it.
 */
export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocationSnapshot>(fallback);
  const [status, setStatus] = useState<GeoPermissionStatus>("idle");

  const request = useCallback(() => {
    if (status !== "idle") return;
    setStatus("requesting");
    void getBrowserGeolocation().then((result) => {
      setLocation(result);
      setStatus(result.latitude !== null ? "granted" : "denied");
    });
  }, [status]);

  const dismiss = useCallback(() => {
    setStatus("denied");
  }, []);

  return { location, status, request, dismiss };
}
