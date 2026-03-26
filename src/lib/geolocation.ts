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

/**
 * Resolves the user's approximate location via IP geolocation.
 * No browser permission required.
 */
export async function getBrowserGeolocation(): Promise<GeoLocationSnapshot> {
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
