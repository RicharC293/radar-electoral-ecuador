export interface GeoLocationSnapshot {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  province: string | null;
  country: string;
}

const fallback: GeoLocationSnapshot = {
  latitude: null,
  longitude: null,
  city: null,
  province: null,
  country: "EC",
};

/** IP-based geolocation — no permission required, approximate. */
async function getIPGeolocation(): Promise<GeoLocationSnapshot> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return fallback;

    const data = await res.json() as {
      latitude?: number;
      longitude?: number;
      city?: string;
      region?: string;
      country_code?: string;
    };

    return {
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      city: data.city ?? null,
      province: data.region ?? null,
      country: data.country_code ?? "EC",
    };
  } catch {
    return fallback;
  }
}

/** GPS coords — only called when permission is already granted (no dialog). */
function getGPSCoords(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 300_000 }
    );
  });
}

/**
 * Hybrid geolocation:
 * - If GPS permission already granted → uses precise GPS coords + IP for city/province.
 * - Otherwise → falls back to IP (no browser dialog shown).
 */
export async function getBrowserGeolocation(): Promise<GeoLocationSnapshot> {
  if (typeof window === "undefined") return fallback;

  // Start IP lookup immediately in parallel
  const ipPromise = getIPGeolocation();

  // Check if GPS permission was already granted (no dialog triggered)
  let gpsCoords: { latitude: number; longitude: number } | null = null;
  if ("permissions" in navigator && "geolocation" in navigator) {
    try {
      const perm = await navigator.permissions.query({ name: "geolocation" });
      if (perm.state === "granted") {
        gpsCoords = await getGPSCoords();
      }
    } catch {
      // Permissions API not supported — skip GPS
    }
  }

  const ipResult = await ipPromise;

  // Merge: precise GPS coords when available, city/province always from IP
  return {
    ...ipResult,
    latitude: gpsCoords?.latitude ?? ipResult.latitude,
    longitude: gpsCoords?.longitude ?? ipResult.longitude,
  };
}
