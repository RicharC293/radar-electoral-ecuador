"use client";

import { useEffect, useState } from "react";

import { getBrowserGeolocation, type GeoLocationSnapshot } from "@/lib/geolocation";

const initialState: GeoLocationSnapshot = {
  latitude: null,
  longitude: null,
  city: null,
  province: null,
  country: "EC"
};

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocationSnapshot>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getBrowserGeolocation().then((result) => {
      if (!active) {
        return;
      }

      setLocation(result);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return { location, loading };
}
