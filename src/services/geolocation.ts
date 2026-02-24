export type Coordinates = { lat: number; lon: number };

export async function detectBrowserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Geolocation not available"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        reject(err);
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 }
    );
  });
}


