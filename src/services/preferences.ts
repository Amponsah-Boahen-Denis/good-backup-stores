export type UserPreferences = {
  layout: "grid" | "list";
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  website?: string;
  logo?: string;
};

const defaultPrefs: UserPreferences = { layout: "grid" };

import { safeGet, safeParse, safeWriteJSON } from "@/services/storage";

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const res = await fetch("/api/user-preferences", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as Partial<UserPreferences>;
    return { ...defaultPrefs, ...json } as UserPreferences;
  } catch {
    if (typeof window !== "undefined") {
      const raw = safeGet("user:prefs");
      return safeParse<UserPreferences>(raw, defaultPrefs);
    }
    return defaultPrefs;
  }
}

export async function updateUserPreferences(next: Partial<UserPreferences>): Promise<UserPreferences> {
  const merged = { ...defaultPrefs, ...next } as UserPreferences;
  try {
    const res = await fetch("/api/user-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    if (typeof window !== "undefined") {
      safeWriteJSON("user:prefs", merged);
    }
  }
  return merged;
}


