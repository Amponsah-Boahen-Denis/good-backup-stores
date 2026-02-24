"use client";

import { useState } from "react";
import Button from "@/components/Button";
import CountryInput from "@/components/CountryInput";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useDetectLocation } from "@/hooks/useDetectLocation";

type Props = {
  defaultCountry?: string;
  defaultLocation?: string;
  onSubmit: (data: { product: string; country: string; location: string }) => void;
};

export default function SearchForm({ defaultCountry = "", defaultLocation = "", onSubmit }: Props) {
  const [country, setCountry] = useState(defaultCountry);
  const [location, setLocation] = useState(defaultLocation);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const { detect } = useDetectLocation();

  const detectUserLocation = async () => {
    setLocationError("");
    setIsDetectingLocation(true);
    try {
      const res = await detect();
      if (res) {
        setCountry(res.country);
        setLocation(res.fullAddress);
        const countryHidden = document.getElementById("country-hidden") as HTMLInputElement | null;
        const locationHidden = document.getElementById("location-hidden") as HTMLInputElement | null;
        if (countryHidden) countryHidden.value = res.country;
        if (locationHidden) locationHidden.value = res.fullAddress;
      } else {
        setLocationError("Failed to detect location. Please enter manually.");
      }
    } catch {
      setLocationError("Failed to detect location. Please enter manually");
    } finally {
      setIsDetectingLocation(false);
    }
  };
  return (
    <div className="space-y-4">
      <form
        className="grid grid-cols-1 md:grid-cols-4 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const data = new FormData(form);
          const product = String(data.get("product") || "");
          onSubmit({ product, country, location });
        }}
        aria-label="Search stores"
      >
        <div className="flex flex-col gap-1 md:col-span-1">
          <label htmlFor="product" className="text-sm font-medium">Product</label>
          <input
            id="product"
            name="product"
            placeholder="e.g., milk, iPhone, bread"
            className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm"
            aria-required="true"
            required
          />
        </div>
        <div className="md:col-span-1">
          <CountryInput id="country" value={country} onChange={setCountry} />
          <input id="country-hidden" type="hidden" name="country" value={country} />
        </div>
        <div className="md:col-span-2">
          <LocationAutocomplete id="location" value={location} onChange={setLocation} />
          <input id="location-hidden" type="hidden" name="location" value={location} />
        </div>
        <div className="md:col-span-4 flex justify-between items-center">
          <Button 
            type="button" 
            onClick={detectUserLocation}
            disabled={isDetectingLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isDetectingLocation ? "Detecting..." : "📍 Use My Address"}
          </Button>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {locationError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{locationError}</p>
        </div>
      )}
    </div>
  );
}


