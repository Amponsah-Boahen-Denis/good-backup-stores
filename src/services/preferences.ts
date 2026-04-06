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

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const res = await fetch("/api/user-preferences", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as Partial<UserPreferences>;
    return { ...defaultPrefs, ...json } as UserPreferences;
  } catch (error) {
    console.error("Failed to fetch preferences:", error);
    throw new Error("Failed to load user preferences from database");
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
    return merged;
  } catch (error) {
    console.error("Failed to save preferences:", error);
    throw new Error("Failed to save user preferences to database");
  }
}


