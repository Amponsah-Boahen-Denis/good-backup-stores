"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import CountryInput from "@/components/CountryInput";
import LogoUpload from "@/components/LogoUpload";
import sanitizeInput from "@/utils/sanitizeInput";
import { StoreSubmission } from "@/services/userStores";

type Props = {
  initial?: Partial<StoreSubmission>;
  onSubmit: (data: Omit<StoreSubmission, "id" | "createdAt" | "updatedAt">) => void;
  onCancel?: () => void;
};

export default function StoreForm({ initial, onSubmit, onCancel }: Props) {
  const idBase = useId();
  const [name, setName] = useState(initial?.name || "");
  const [country, setCountry] = useState(initial?.country || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [logo, setLogo] = useState(initial?.logo || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [website, setWebsite] = useState(initial?.website || "");
  const [lat, setLat] = useState(initial?.lat?.toString() || "");
  const [lon, setLon] = useState(initial?.lon?.toString() || "");
  const [workingHours, setWorkingHours] = useState(initial?.workingHours || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = {
      name: sanitizeInput(name),
      country: sanitizeInput(country),
      address: sanitizeInput(address),
      logo: logo || null,
      website: website ? sanitizeInput(String(website)) : null,
      email: email ? sanitizeInput(String(email)) : null,
      phone: phone ? sanitizeInput(String(phone)) : null,
      workingHours: workingHours ? sanitizeInput(String(workingHours)) : null,
      lat: lat ? parseFloat(lat) : null,
      lon: lon ? parseFloat(lon) : null,
    } as Omit<StoreSubmission, "id" | "createdAt" | "updatedAt">;
    if (!cleaned.name) return setError("Store name is required.");
    if (!cleaned.country) return setError("Country is required.");
    if (!cleaned.address) return setError("Address is required.");
    if (!cleaned.logo) return setError("Store logo is required.");
    if (lat && isNaN(parseFloat(lat))) return setError("Latitude must be a valid number.");
    if (lon && isNaN(parseFloat(lon))) return setError("Longitude must be a valid number.");
    onSubmit(cleaned);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} aria-label="Store submission form">
      {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
      
      {/* Logo Upload */}
      <div>
        <LogoUpload 
          onUpload={setLogo} 
          currentLogo={logo} 
          label="Store Logo (required)" 
          userId={`store_${initial?.id || 'new'}`}
        />
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idBase}-name`} className="text-sm font-medium">Store name *</label>
          <input id={`${idBase}-name`} value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm" required />
        </div>
        <div>
          <CountryInput id={`${idBase}-country`} value={country} onChange={setCountry} />
        </div>
        <div className="md:col-span-2 flex flex-col gap-1">
          <label htmlFor={`${idBase}-address`} className="text-sm font-medium">Address *</label>
          <input id={`${idBase}-address`} value={address} onChange={(e) => setAddress(e.target.value)} className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm" required />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-black/70 dark:text-white/70">Contact (optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${idBase}-phone`} className="text-sm font-medium">Phone</label>
            <input id={`${idBase}-phone`} value={phone || ""} onChange={(e) => setPhone(e.target.value)} className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${idBase}-email`} className="text-sm font-medium">Email</label>
            <input id={`${idBase}-email`} value={email || ""} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm" type="email" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${idBase}-website`} className="text-sm font-medium">Website</label>
            <input id={`${idBase}-website`} value={website || ""} onChange={(e) => setWebsite(e.target.value)} className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm" placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-black/70 dark:text-white/70">Working Hours (optional)</h3>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idBase}-workingHours`} className="text-sm font-medium">Hours</label>
          <input
            id={`${idBase}-workingHours`}
            value={workingHours || ""}
            onChange={(e) => setWorkingHours(e.target.value)}
            className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm"
            placeholder="e.g., 09:00-17:00 or Mo-Fr 09:00-17:00, Sa 10:00-16:00"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Format: HH:MM-HH:MM or add days (e.g., Mo-Fr 09:00-17:00)
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-black/70 dark:text-white/70">Location (optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${idBase}-lat`} className="text-sm font-medium">Latitude</label>
            <input id={`${idBase}-lat`} value={lat} onChange={(e) => setLat(e.target.value)} className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm" placeholder="e.g., 40.7128" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${idBase}-lon`} className="text-sm font-medium">Longitude</label>
            <input id={`${idBase}-lon`} value={lon} onChange={(e) => setLon(e.target.value)} className="h-10 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 text-sm" placeholder="e.g., -74.0060" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">Save store</Button>
      </div>
    </form>
  );
}


