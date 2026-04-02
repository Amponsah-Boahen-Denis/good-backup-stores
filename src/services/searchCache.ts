// LocalStorage-based search cache and canonical store index
// This mimics the DB-first read-through/write-back design for later backend swap

import { Place } from "@/services/openstreet";
import extractProductName from "@/utils/extractProductName";
import { safeGet, safeParse, safeWriteJSON } from "@/services/storage";

export type CanonicalStore = {
  id: string;
  name: string;
  country?: string;
  address?: string;
  lat: number;
  lon: number;
  contact?: { phone?: string | null; email?: string | null; website?: string | null };
  category?: string | null;
  tags?: string[];
  providers?: { source: "osm" | "google"; externalId?: string; fetchedAt: number }[];
  createdAt: number;
  updatedAt: number;
};

export type SearchSnapshot = {
  key: string;
  query: { product: string; category?: string[] | null; country?: string; lat?: number; lon?: number; radiusMeters: number };
  storeIds: string[];
  totalCount: number;
  source: "db" | "provider" | "mixed";
  createdAt: number;
};

const LS_STORES = "cache:stores";
const LS_SNAPSHOTS = "cache:search:snapshots";

function readJSON<T>(key: string, fallback: T): T {
  const raw = safeGet(key);
  return safeParse<T>(raw, fallback);
}

function writeJSON<T>(key: string, value: T) {
  safeWriteJSON(key, value);
}

export function makeCacheKey(product: string, category: string | string[] | null | undefined, country: string | undefined, lat?: number, lon?: number, radiusMeters: number = 5000): string {
  const p = extractProductName(product).toLowerCase();
  const c = Array.isArray(category)
    ? category.map((item) => item.toLowerCase()).join(",")
    : (category || "").toLowerCase();
  const co = (country || "").toLowerCase();
  const coord = lat && lon ? `${lat.toFixed(3)},${lon.toFixed(3)}` : "";
  return [p, c, co, coord, radiusMeters].filter(Boolean).join("|");
}

export function getCanonicalStores(): Record<string, CanonicalStore> {
  return readJSON<Record<string, CanonicalStore>>(LS_STORES, {});
}

export function getSearchSnapshots(): Record<string, SearchSnapshot> {
  return readJSON<Record<string, SearchSnapshot>>(LS_SNAPSHOTS, {});
}

export function saveCanonicalStores(map: Record<string, CanonicalStore>) {
  writeJSON(LS_STORES, map);
}

export function saveSearchSnapshots(map: Record<string, SearchSnapshot>) {
  writeJSON(LS_SNAPSHOTS, map);
}

export function upsertStores(places: Place[], category: string | string[] | null): string[] {
  const stores = getCanonicalStores();
  const now = Date.now();
  const ids: string[] = [];
  for (const p of places) {
    // Stable key by name + coarse coords
    const stable = `${(p.name || "").toLowerCase()}|${p.lat.toFixed(4)},${p.lon.toFixed(4)}`;
    const existing = Object.values(stores).find((s) => `${s.name.toLowerCase()}|${s.lat.toFixed(4)},${s.lon.toFixed(4)}` === stable);
    const id = existing?.id || crypto.randomUUID();
    const next: CanonicalStore = {
      id,
      name: p.name || "Unnamed",
      country: p.address?.split(", ").pop(), // rough extraction
      address: p.address,
      lat: p.lat,
      lon: p.lon,
      contact: { phone: p.phone ?? undefined, email: p.email ?? undefined, website: p.website ?? undefined },
      category: Array.isArray(category) ? category.join(", ") : category || null,
      tags: p.tags || [],
      providers: [{ source: "osm", fetchedAt: now }],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    stores[id] = next;
    ids.push(id);
  }
  saveCanonicalStores(stores);
  return ids;
}

export function getSnapshot(key: string): SearchSnapshot | null {
  const snaps = getSearchSnapshots();
  return snaps[key] || null;
}

export function upsertSnapshot(snap: SearchSnapshot) {
  const snaps = getSearchSnapshots();
  snaps[snap.key] = snap;
  saveSearchSnapshots(snaps);
}

export function getStoresByIds(ids: string[]): CanonicalStore[] {
  const map = getCanonicalStores();
  return ids.map((id) => map[id]).filter(Boolean);
}


