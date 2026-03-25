/**
 * Simple in-memory TTL cache for serverless environments.
 * Each Vercel function instance keeps its own cache — this reduces
 * DB/API calls during the lifetime of a warm instance.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.value as T
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function cacheDelete(key: string): void {
  store.delete(key)
}

/** Delete all keys matching a prefix */
export function cacheInvalidatePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key)
    }
  }
}

/** TTL constants (milliseconds) */
export const TTL = {
  GOLD_PRICE: 86_400_000,  // 24 hours — fetch once per day to avoid rate limits
  SITE_SETTINGS: 60_000,   // 60 seconds — rarely changes
  SESSION: 300_000,         // 5 minutes — for last_activity throttle
} as const
