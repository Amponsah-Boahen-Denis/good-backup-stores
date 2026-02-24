"use client";

import { useEffect, useState } from "react";
import type { UserPreferences } from "@/services/preferences";
import { getUserPreferences, updateUserPreferences } from "@/services/preferences";

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>({ layout: "grid" });

  useEffect(() => {
    let mounted = true;
    getUserPreferences()
      .then((p) => {
        if (mounted) setPrefs(p);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const setLayout = async (layout: "grid" | "list") => {
    const next: UserPreferences = { ...prefs, layout };
    setPrefs(next);
    try {
      await updateUserPreferences({ layout });
    } catch {
      // fallback already handled in updateUserPreferences
    }
  };

  return { prefs, setLayout } as const;
}
