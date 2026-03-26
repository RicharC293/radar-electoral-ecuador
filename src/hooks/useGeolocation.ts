"use client";

import { useEffect, useState } from "react";

import { getBrowserGeolocation, type GeoLocationSnapshot } from "@/lib/geolocation";

const fallback: GeoLocationSnapshot = {
  latitude: null,
  longitude: null,
  city: null,
  province: null,
  country: "EC",
};

/**
 * Resolves the user's location via IP — no browser permission required.
 */
export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocationSnapshot>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getBrowserGeolocation().then((result) => {
      if (active) {
        setLocation(result);
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, []);

  return { location, loading };
}
