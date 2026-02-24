"use client";

import { useState } from "react";
import { reverseGeocode } from "@/services/openstreet";

export function useDetectLocation() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = async (): Promise<{ country: string; fullAddress: string } | null> => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("Geolocation not available");
      return null;
    }
    setIsDetecting(true);
    setError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 })
      );
      const { latitude, longitude } = pos.coords;
      const geo = await reverseGeocode(latitude, longitude);
      if (!geo || !geo.address) {
        setError("Failed to determine address");
        return null;
      }
      const address = geo.address || {};
      const detectedCountry = (address.country as string) || "";
      const addressParts = [
        address.house_number,
        address.road,
        address.suburb,
        address.city || address.town || address.village,
        address.state,
        address.country,
      ].filter(Boolean);
      const fullAddress = addressParts.join(", ");
      return { country: detectedCountry, fullAddress };
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError(String(e) || "Detection failed");
      return null;
    } finally {
      setIsDetecting(false);
    }
  };

  return { detect, isDetecting, error } as const;
}
