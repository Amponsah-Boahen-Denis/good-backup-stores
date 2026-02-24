import { safeGet, safeWriteJSON } from "@/services/storage";

export type StoreAnalytics = {
  storeId: string;
  storeName: string;
  appearances: number;
  clicks: number;
  createdAt: number;
  lastAppeared: number | null;
};

export type BusinessAnalytics = {
  totalStores: number;
  totalAppearances: number;
  totalClicks: number;
  totalSearches: number;
  averageAppearancesPerStore: number;
  stores: StoreAnalytics[];
};

/**
 * Get all business analytics
 */
export function getBusinessAnalytics(): BusinessAnalytics {
  const raw = safeGet("business:analytics");
  const data = raw ? JSON.parse(raw) : { stores: [] };

  const totalAppearances = data.stores.reduce((sum: number, s: StoreAnalytics) => sum + s.appearances, 0);
  const totalClicks = data.stores.reduce((sum: number, s: StoreAnalytics) => sum + s.clicks, 0);
  const totalStores = data.stores.length;

  return {
    totalStores,
    totalAppearances,
    totalClicks,
    totalSearches: safeGet("search:count") ? parseInt(safeGet("search:count")!) : 0,
    averageAppearancesPerStore: totalStores > 0 ? Math.round(totalAppearances / totalStores) : 0,
    stores: data.stores,
  };
}

/**
 * Track a store appearance in search results
 */
export function trackStoreAppearance(storeId: string, storeName: string): void {
  const raw = safeGet("business:analytics");
  const data = raw ? JSON.parse(raw) : { stores: [] };

  let store = data.stores.find((s: StoreAnalytics) => s.storeId === storeId);
  if (!store) {
    store = {
      storeId,
      storeName,
      appearances: 0,
      clicks: 0,
      createdAt: Date.now(),
      lastAppeared: null,
    };
    data.stores.push(store);
  }

  store.appearances += 1;
  store.lastAppeared = Date.now();

  safeWriteJSON("business:analytics", data);
}

/**
 * Track a store click/view from search results
 */
export function trackStoreClick(storeId: string): void {
  const raw = safeGet("business:analytics");
  const data = raw ? JSON.parse(raw) : { stores: [] };

  const store = data.stores.find((s: StoreAnalytics) => s.storeId === storeId);
  if (store) {
    store.clicks += 1;
    safeWriteJSON("business:analytics", data);
  }
}

/**
 * Track total searches performed
 */
export function incrementSearchCount(): void {
  const current = safeGet("search:count") ? parseInt(safeGet("search:count")!) : 0;
  safeWriteJSON("search:count", current + 1);
}

/**
 * Reset all analytics (for fresh start)
 */
export function resetAnalytics(): void {
  localStorage.removeItem("business:analytics");
  localStorage.removeItem("search:count");
}
