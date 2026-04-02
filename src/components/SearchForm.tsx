"use client";

import { useState } from "react";
import Button from "@/components/Button";
import CountryInput from "@/components/CountryInput";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useDetectLocation } from "@/hooks/useDetectLocation";
import { storeCategories } from "@/utils/storeCategories";

type Props = {
  defaultCountry?: string;
  defaultLocation?: string;
  onSubmit: (data: { product: string; country: string; location: string; categories: string[] }) => void;
};

export default function SearchForm({ defaultCountry = "", defaultLocation = "", onSubmit }: Props) {
  const [country, setCountry] = useState(defaultCountry);
  const [location, setLocation] = useState(defaultLocation);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
        className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const data = new FormData(form);
          const product = String(data.get("product") || "");
          onSubmit({ product, country, location, categories: selectedCategories });
        }}
        aria-label="Search stores"
      >
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm lg:sticky lg:top-6">
          <div>
            <p className="text-sm font-semibold">Categories</p>
            <p className="mt-1 text-sm text-slate-500">Scroll and select categories to refine your search.</p>
          </div>
          <div className="mt-4 max-h-[62vh] overflow-y-auto pr-1 space-y-2">
            {storeCategories.map((category) => (
              <label key={category.value} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition hover:border-sky-300">
                <input
                  type="checkbox"
                  value={category.value}
                  checked={selectedCategories.includes(category.value)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCategories((current) =>
                      current.includes(value)
                        ? current.filter((item) => item !== value)
                        : [...current, value]
                    );
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                {category.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Find Stores</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label htmlFor="product" className="block text-sm font-semibold text-slate-800 tracking-wide">
                    What are you looking for?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="product"
                    name="product"
                    placeholder="e.g., milk, iPhone, bread"
                    className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 ease-out focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 hover:border-slate-300"
                    aria-required="true"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <CountryInput id="country" value={country} onChange={setCountry} />
                  <input id="country-hidden" type="hidden" name="country" value={country} />
                </div>
                <div className="space-y-3">
                  <LocationAutocomplete id="location" value={location} onChange={setLocation} />
                  <input id="location-hidden" type="hidden" name="location" value={location} />
                </div>
              </div>
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <Button
                    type="button"
                    onClick={detectUserLocation}
                    disabled={isDetectingLocation}
                    variant="secondary"
                    className="rounded-xl px-6 py-3 text-sm font-medium border-2 border-slate-200 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 transition-all duration-200"
                  >
                    {isDetectingLocation ? "Detecting..." : "📍 Use My Address"}
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 px-10 py-3 text-sm font-bold text-white shadow-xl shadow-sky-500/30 transition-all duration-200 hover:from-sky-700 hover:to-sky-800 hover:shadow-2xl hover:shadow-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-300 transform hover:scale-[1.02]"
                  >
                    🔍 Search Stores
                  </Button>
                </div>
              </div>
            </div>
          </div>
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


