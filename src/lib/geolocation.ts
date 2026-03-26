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
export async function getIPGeolocation(): Promise<GeoLocationSnapshot> {
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

/** GPS via browser — shows the native permission dialog. */
function getGPSLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null), // denied or unavailable → null
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    );
  });
}

/**
 * Hybrid geolocation strategy:
 * 1. Shows the native GPS permission dialog.
 * 2. If granted → uses precise GPS coords (city/province enriched via IP).
 * 3. If denied   → silently falls back to IP geolocation.
 *
 * IMPORTANT: getGPSLocation() must be called synchronously (before any await)
 * so that getCurrentPosition() fires within the original user-gesture context.
 * iOS WebKit (used by all iOS browsers) silently blocks the permission dialog
 * if the call happens after any async tick / Promise resolution.
 */
export async function getBrowserGeolocation(): Promise<GeoLocationSnapshot> {
  if (typeof window === "undefined") return fallback;

  // ⚠️  Start GPS FIRST — synchronously — to preserve iOS user-gesture context.
  // getCurrentPosition() is registered here before any await or fetch.
  const gpsPromise = "geolocation" in navigator ? getGPSLocation() : Promise.resolve(null);

  // Start IP lookup in parallel now that the gesture-sensitive call is queued.
  const ipPromise = getIPGeolocation();

  const gps = await gpsPromise;

  if (gps) {
    // Permission granted — merge precise GPS coords with IP city/province
    const ipResult = await ipPromise;
    return {
      ...ipResult,
      latitude: gps.latitude,
      longitude: gps.longitude,
    };
  }

  // Permission denied or GPS unavailable — fall back to IP
  return ipPromise;
}
