// Frontend stub for caching. Real implementation will be server-side.

export type CachedResult<T> = { key: string; value: T; timestamp: number };

export async function checkMongoDB(): Promise<null> {
  // Stub: always miss cache on frontend.
  return null;
}

export async function saveToMongoDB(): Promise<void> {
  // Stub: no-op on frontend.
}


