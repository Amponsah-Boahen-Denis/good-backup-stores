import sanitizeInput from "@/utils/sanitizeInput";

export type StoreSubmission = {
  id: string;
  name: string;
  category?: string[] | null;
  country: string;
  address: string;
  logo?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  workingHours?: string | null; // e.g., "09:00-17:00" or "Mo-Fr 09:00-17:00, Sa 10:00-16:00"
  lat?: number | null;
  lon?: number | null;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "user:stores";
import { safeGet, safeParse, safeWriteJSON } from "@/services/storage";

export async function listStores(): Promise<StoreSubmission[]> {
  if (typeof window === "undefined") return [];
  // Use server API
  try {
    const res = await fetch("/api/stores");
    if (res.ok) {
      const json = (await res.json()) as StoreSubmission[];
      return json;
    }
    throw new Error(`API error: ${res.status}`);
  } catch (error) {
    console.error("Failed to fetch stores:", error);
    throw new Error("Failed to load stores from database");
  }
}

export async function saveStore(input: Omit<StoreSubmission, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<StoreSubmission> {
  if (typeof window === "undefined") throw new Error("Unavailable on server");
  const now = Date.now();
  const cleaned: StoreSubmission = {
    id: input.id || crypto.randomUUID(),
    name: sanitizeInput(input.name),
    category: input.category ? input.category.map((category) => sanitizeInput(category)) : null,
    country: sanitizeInput(input.country),
    address: sanitizeInput(input.address),
    logo: input.logo || null,
    website: input.website ? sanitizeInput(input.website) : null,
    email: input.email ? sanitizeInput(input.email) : null,
    phone: input.phone ? sanitizeInput(input.phone) : null,
    workingHours: input.workingHours ? sanitizeInput(input.workingHours) : null,
    lat: input.lat || null,
    lon: input.lon || null,
    createdAt: input.id ? Date.now() : now,
    updatedAt: now,
  };

  // Use server API
  try {
    if (input.id) {
      const res = await fetch("/api/stores", { method: "PUT", body: JSON.stringify(cleaned), headers: { "Content-Type": "application/json" } });
      if (res.ok) return (await res.json()) as StoreSubmission;
      throw new Error(`Update failed: ${res.status}`);
    } else {
      const res = await fetch("/api/stores", { method: "POST", body: JSON.stringify(cleaned), headers: { "Content-Type": "application/json" } });
      if (res.ok) return (await res.json()) as StoreSubmission;
      throw new Error(`Create failed: ${res.status}`);
    }
  } catch (error) {
    console.error("Failed to save store:", error);
    throw new Error("Failed to save store to database");
  }
}

export async function deleteStore(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  // Use server API
  try {
    const res = await fetch(`/api/stores?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) return;
    throw new Error(`Delete failed: ${res.status}`);
  } catch (error) {
    console.error("Failed to delete store:", error);
    throw new Error("Failed to delete store from database");
  }
}


