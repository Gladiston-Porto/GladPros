// src/lib/db-metadata.ts
import { prisma } from "@/server/db";

// Simple in-memory cache to avoid hitting information_schema repeatedly in dev
let hasTokenVersionCache: boolean | null = null;
let hasTokenVersionCachedAt = 0;

/**
 * Checks if the Usuario.tokenVersion column exists in the current database.
 * Caches the result per server process to prevent noisy failing queries in dev.
 */
export async function hasTokenVersionColumn(): Promise<boolean> {
  const ttlMs = process.env.NODE_ENV === 'production' ? 60000 : 10000; // 60s prod, 10s dev
  const now = Date.now();
  if (hasTokenVersionCache !== null && (now - hasTokenVersionCachedAt) < ttlMs) {
    return hasTokenVersionCache;
  }
  try {
    const rows = await prisma.$queryRaw<Array<{ cnt: number }>>`
      SELECT COUNT(*) AS cnt
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'Usuario'
        AND COLUMN_NAME = 'tokenVersion'
    `;
    hasTokenVersionCache = (rows?.[0]?.cnt ?? 0) > 0;
    hasTokenVersionCachedAt = now;
    return hasTokenVersionCache;
  } catch {
    // If we cannot determine, assume it doesn't exist to avoid further errors
    hasTokenVersionCache = false;
    hasTokenVersionCachedAt = now;
    return false;
  }
}

/**
 * Allows tests or admin endpoints to refresh the cache after a migration.
 */
export function __resetDbMetadataCache() {
  hasTokenVersionCache = null;
  hasTokenVersionCachedAt = 0;
}
