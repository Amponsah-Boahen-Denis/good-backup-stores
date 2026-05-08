"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import CountryInput from "@/components/CountryInput";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useDetectLocation } from "@/hooks/useDetectLocation";
import { storeCategories } from "@/utils/storeCategories";

type Props = {
  defaultProduct?: string;
  defaultCountry?: string;
  defaultLocation?: string;
  onSubmit: (data: { product: string; country: string; location: string; categories: string[] }) => void;
};

export default function SearchForm({ defaultProduct = "", defaultCountry = "", defaultLocation = "", onSubmit }: Props) {
  const [product, setProduct] = useState(defaultProduct);
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
  useEffect(() => {
    setProduct(defaultProduct);
  }, [defaultProduct]);

  useEffect(() => {
    setCountry(defaultCountry);
  }, [defaultCountry]);

  useEffect(() => {
    setLocation(defaultLocation);
  }, [defaultLocation]);

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
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
          <div>
            <p className="text-sm font-semibold text-gray-900">Categories</p>
            <p className="mt-1 text-sm text-gray-600">Scroll and select categories to refine your search.</p>
          </div>
          <div className="mt-4 max-h-[62vh] overflow-y-auto pr-1 space-y-2">
            {storeCategories.map((category) => (
              <label key={category.value} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition hover:border-[#0A66C2] hover:bg-[#E7F0F7]">
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
                  className="h-4 w-4 rounded border-gray-300 text-[#0A66C2] focus:ring-[#0A66C2]"
                />
                {category.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Find Stores</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label htmlFor="product" className="block text-sm font-semibold text-gray-900 tracking-wide">
                    What are you looking for?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="product"
                    name="product"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g., store name, product, or service"
                    className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 transition-all duration-200 ease-out focus:border-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#E7F0F7] hover:border-gray-400"
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
              <div className="pt-4 flex gap-3 justify-center">
                <Button
                  type="button"
                  onClick={detectUserLocation}
                  disabled={isDetectingLocation}
                  variant="secondary"
                  className="h-12 rounded-lg px-6 text-sm font-semibold border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E7F0F7] disabled:cursor-not-allowed disabled:bg-gray-100 transition-all duration-200"
                >
                  {isDetectingLocation ? "Detecting..." : "📍 Use My Address"}
                </Button>
                <Button
                  type="submit"
                  className="h-12 rounded-lg bg-[#0A66C2] px-12 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#0052A3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] hover:shadow-lg"
                >
                  🔍 Search Stores
                </Button>
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


