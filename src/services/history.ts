export type SearchHistoryItem = {
  id: string;
  product: string;
  country: string;
  location: string;
  resultsCount: number;
  createdAt: number;
};

const STORAGE_KEY = "user:history";
import { safeGet, safeParse, safeWriteJSON, safeRemove } from "@/services/storage";

export async function listHistory(): Promise<SearchHistoryItem[]> {
  if (typeof window === "undefined") return [];
  const raw = safeGet(STORAGE_KEY);
  return safeParse<SearchHistoryItem[]>(raw, []);
}

export async function addHistory(item: Omit<SearchHistoryItem, "id" | "createdAt">): Promise<SearchHistoryItem> {
  if (typeof window === "undefined") throw new Error("Unavailable on server");
  const entry: SearchHistoryItem = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
  const items = await listHistory();
  items.unshift(entry);
  const trimmed = items.slice(0, 50);
  safeWriteJSON(STORAGE_KEY, trimmed);
  return entry;
}

export async function clearHistory(): Promise<void> {
  if (typeof window === "undefined") return;
  safeRemove(STORAGE_KEY);
}

export type HistoryAnalytics = {
  totalSearches: number;
  searchesToday: number;
  uniqueProducts: number;
  topProducts: { name: string; count: number }[];
  topCountries: { name: string; count: number }[];
  lastSearchAt: number | null;
};

export async function getHistoryAnalytics(): Promise<HistoryAnalytics> {
  const items = await listHistory();
  const totalSearches = items.length;
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const searchesToday = items.filter(i => i.createdAt >= startOfDay.getTime()).length;
  const lastSearchAt = items[0]?.createdAt ?? null;

  const productCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  for (const i of items) {
    const p = (i.product || "").trim().toLowerCase();
    if (p) productCounts.set(p, (productCounts.get(p) || 0) + 1);
    const c = (i.country || "").trim().toLowerCase();
    if (c) countryCounts.set(c, (countryCounts.get(c) || 0) + 1);
  }
  const uniqueProducts = productCounts.size;
  const topProducts = Array.from(productCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topCountries = Array.from(countryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { totalSearches, searchesToday, uniqueProducts, topProducts, topCountries, lastSearchAt };
}


