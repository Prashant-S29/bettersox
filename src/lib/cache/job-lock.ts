import { redis } from "~/lib/redis/client";

const LOCK_TTL = 300; // 5 minutes in seconds

export async function acquireLock(lockName: string): Promise<boolean> {
  try {
    const key = `lock:${lockName}`;
    const lockId = `${Date.now()}-${Math.random()}`;

    // Try to set the lock with NX (only if not exists) and EX (expiry)
    const result = await redis.set(key, lockId, {
      nx: true, // Only set if key doesn't exist
      ex: LOCK_TTL, // Expire after 5 minutes
    });

    // Redis returns 'OK' if lock was acquired, null if key already exists
    return result === "OK";
  } catch (error) {
    console.error(`[Lock] Failed to acquire lock "${lockName}":`, error);
    return false;
  }
}

/**
 * Release a distributed lock
 */
export async function releaseLock(lockName: string): Promise<void> {
  try {
    const key = `lock:${lockName}`;
    await redis.del(key);
  } catch (error) {
    console.error(`[Lock] Failed to release lock "${lockName}":`, error);
  }
}

/**
 * Check if a lock exists
 */
export async function isLocked(lockName: string): Promise<boolean> {
  try {
    const key = `lock:${lockName}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`[Lock] Failed to check lock "${lockName}":`, error);
    return false;
  }
}
