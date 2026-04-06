// MongoDB-based search cache and canonical store index

import { Place } from "@/services/openstreet";
import extractProductName from "@/utils/extractProductName";

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

export function makeCacheKey(product: string, category: string | string[] | null | undefined, country: string | undefined, lat?: number, lon?: number, radiusMeters: number = 5000): string {
  const p = extractProductName(product).toLowerCase();
  const c = Array.isArray(category)
    ? category.map((item) => item.toLowerCase()).join(",")
    : (category || "").toLowerCase();
  const co = (country || "").toLowerCase();
  const coord = lat && lon ? `${lat.toFixed(3)},${lon.toFixed(3)}` : "";
  return [p, c, co, coord, radiusMeters].filter(Boolean).join("|");
}

export async function getSearchSnapshot(key: string): Promise<SearchSnapshot | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(`/api/search-cache?key=${encodeURIComponent(key)}`);
    if (res.ok) {
      const data = await res.json();
      return data as SearchSnapshot;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch search snapshot:", error);
    return null;
  }
}

export async function saveSearchSnapshot(snapshot: SearchSnapshot): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/search-cache", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
  } catch (error) {
    console.error("Failed to save search snapshot:", error);
  }
}

export async function upsertStores(places: Place[], category: string | string[] | null): Promise<string[]> {
  if (typeof window === "undefined") return [];

  const now = Date.now();
  const storesToUpsert: CanonicalStore[] = [];

  for (const p of places) {
    // Stable key by name + coarse coords
    const stable = `${(p.name || "").toLowerCase()}|${p.lat.toFixed(4)},${p.lon.toFixed(4)}`;
    const id = crypto.randomUUID(); // For now, always create new - in production you'd check for existing

    const store: CanonicalStore = {
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
      createdAt: now,
      updatedAt: now,
    };

    storesToUpsert.push(store);
  }

  try {
    await fetch("/api/canonical-stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(storesToUpsert),
    });
  } catch (error) {
    console.error("Failed to upsert canonical stores:", error);
  }

  return storesToUpsert.map(s => s.id);
}

export async function getSnapshot(key: string): Promise<SearchSnapshot | null> {
  return getSearchSnapshot(key);
}

export async function upsertSnapshot(snap: SearchSnapshot): Promise<void> {
  await saveSearchSnapshot(snap);
}

export async function getStoresByIds(ids: string[]): Promise<CanonicalStore[]> {
  if (typeof window === "undefined") return [];
  if (ids.length === 0) return [];

  try {
    const res = await fetch(`/api/canonical-stores?ids=${ids.join(",")}`);
    if (res.ok) {
      const storeMap = await res.json() as Record<string, CanonicalStore>;
      return ids.map(id => storeMap[id]).filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch canonical stores:", error);
    return [];
  }
}


