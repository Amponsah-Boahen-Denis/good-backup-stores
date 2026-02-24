import sanitizeInput from "@/utils/sanitizeInput";

export type StoreSubmission = {
  id: string;
  name: string;
  country: string;
  address: string;
  logo?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  lat?: number | null;
  lon?: number | null;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "user:stores";
import { safeGet, safeParse, safeWriteJSON } from "@/services/storage";

export async function listStores(): Promise<StoreSubmission[]> {
  if (typeof window === "undefined") return [];
  // Try server API first
  try {
    const res = await fetch("/api/stores");
    if (res.ok) {
      const json = (await res.json()) as StoreSubmission[];
      return json;
    }
  } catch {
    // ignore and fallback to local
  }
  const raw = safeGet(STORAGE_KEY);
  return safeParse<StoreSubmission[]>(raw, []);
}

export async function saveStore(input: Omit<StoreSubmission, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<StoreSubmission> {
  if (typeof window === "undefined") throw new Error("Unavailable on server");
  const now = Date.now();
  const cleaned: StoreSubmission = {
    id: input.id || crypto.randomUUID(),
    name: sanitizeInput(input.name),
    country: sanitizeInput(input.country),
    address: sanitizeInput(input.address),
    logo: input.logo || null,
    website: input.website ? sanitizeInput(input.website) : null,
    email: input.email ? sanitizeInput(input.email) : null,
    phone: input.phone ? sanitizeInput(input.phone) : null,
    lat: input.lat || null,
    lon: input.lon || null,
    createdAt: input.id ? Date.now() : now,
    updatedAt: now,
  };

  // Try server API
  try {
    if (input.id) {
      const res = await fetch("/api/stores", { method: "PUT", body: JSON.stringify(cleaned), headers: { "Content-Type": "application/json" } });
      if (res.ok) return (await res.json()) as StoreSubmission;
    } else {
      const res = await fetch("/api/stores", { method: "POST", body: JSON.stringify(cleaned), headers: { "Content-Type": "application/json" } });
      if (res.ok) return (await res.json()) as StoreSubmission;
    }
  } catch {
    // fall through to local save
  }

  const stores = await listStores();
  cleaned.createdAt = input.id ? (stores.find(s => s.id === input.id)?.createdAt || now) : now;
  const idx = stores.findIndex(s => s.id === cleaned.id);
  if (idx >= 0) stores[idx] = cleaned; else stores.push(cleaned);
  safeWriteJSON(STORAGE_KEY, stores);
  return cleaned;
}

export async function deleteStore(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  // Try server API
  try {
    const res = await fetch(`/api/stores?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) return;
  } catch {
    // fallback
  }
  const stores = await listStores();
  const next = stores.filter(s => s.id !== id);
  safeWriteJSON(STORAGE_KEY, next);
}


