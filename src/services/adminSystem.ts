import { safeRemove } from "@/services/storage";
import { resetAnalytics } from "@/services/businessAnalytics";
import { clearHistory } from "@/services/history";

export type SystemSettings = {
  maintenanceMode: boolean;
  maxSearchResults: number;
  cacheExpiryHours: number;
  allowStoreSubmissions: boolean;
  requireApproval: boolean;
};

const SETTINGS_KEY = "admin:settings";

function getSettings(): SystemSettings {
  if (typeof window === "undefined") return getDefaultSettings();
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return getDefaultSettings();
  try {
    return { ...getDefaultSettings(), ...JSON.parse(raw) };
  } catch {
    return getDefaultSettings();
  }
}

function getDefaultSettings(): SystemSettings {
  return {
    maintenanceMode: false,
    maxSearchResults: 50,
    cacheExpiryHours: 24,
    allowStoreSubmissions: true,
    requireApproval: false,
  };
}

function saveSettings(settings: SystemSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getSystemSettings(): SystemSettings {
  return getSettings();
}

export function updateSystemSettings(updates: Partial<SystemSettings>): SystemSettings {
  const current = getSettings();
  const updated = { ...current, ...updates };
  saveSettings(updated);
  return updated;
}

export async function clearAllCaches(): Promise<void> {
  // Clear search cache
  safeRemove("search:cache");
  safeRemove("search:snapshots");

  // Clear user data caches
  safeRemove("user:history");
  safeRemove("user:stores");

  // Note: Keep user preferences and admin data
}

export async function resetAllAnalytics(): Promise<void> {
  resetAnalytics();
  await clearHistory();
}

export async function exportAllData(): Promise<string> {
  const data = {
    users: localStorage.getItem("admin:users"),
    stores: localStorage.getItem("user:stores"),
    analytics: localStorage.getItem("business:analytics"),
    history: localStorage.getItem("user:history"),
    cache: localStorage.getItem("search:cache"),
    snapshots: localStorage.getItem("search:snapshots"),
    preferences: localStorage.getItem("user:preferences"),
    settings: localStorage.getItem("admin:settings"),
    searchCount: localStorage.getItem("search:count"),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export async function importData(jsonData: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonData);
    if (data.users) localStorage.setItem("admin:users", data.users);
    if (data.stores) localStorage.setItem("user:stores", data.stores);
    if (data.analytics) localStorage.setItem("business:analytics", data.analytics);
    if (data.history) localStorage.setItem("user:history", data.history);
    if (data.cache) localStorage.setItem("search:cache", data.cache);
    if (data.snapshots) localStorage.setItem("search:snapshots", data.snapshots);
    if (data.preferences) localStorage.setItem("user:preferences", data.preferences);
    if (data.settings) localStorage.setItem("admin:settings", data.settings);
    if (data.searchCount) localStorage.setItem("search:count", data.searchCount);
    return { success: true, message: "Data imported successfully" };
  } catch (error) {
    return { success: false, message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}