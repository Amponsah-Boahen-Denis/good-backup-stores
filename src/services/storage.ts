// Small safe wrapper around localStorage to centralize parsing/serialization
export function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
}

export function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function safeWriteJSON<T>(key: string, value: T): void {
  try { safeSet(key, JSON.stringify(value)); } catch { /* ignore */ }
}
