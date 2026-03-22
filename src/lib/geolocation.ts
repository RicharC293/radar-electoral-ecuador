export interface GeoLocationSnapshot {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  province: string | null;
  country: string;
}

export async function getBrowserGeolocation(): Promise<GeoLocationSnapshot> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return {
      latitude: null,
      longitude: null,
      city: null,
      province: null,
      country: "EC"
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: null,
          province: null,
          country: "EC"
        });
      },
      () => {
        resolve({
          latitude: null,
          longitude: null,
          city: null,
          province: null,
          country: "EC"
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      }
    );
  });
}
