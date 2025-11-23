import { Redis } from "@upstash/redis";
import { env } from "~/env";
import type { RepoActivityData } from "~/types/github";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const CACHE_TTL = 60 * 10; // 10 minutes

/**
 * Get cached activity data for a repository
 */
export async function getCachedActivity(
  owner: string,
  name: string,
): Promise<RepoActivityData | null> {
  try {
    const key = `activity:${owner}/${name}`;
    const cached = await redis.get(key);

    if (!cached) {
      return null;
    }

    // Check if it's already an object or needs parsing
    if (typeof cached === "string") {
      return JSON.parse(cached) as RepoActivityData;
    }

    // Upstash might auto-parse, return as-is
    return cached as RepoActivityData;
  } catch (error) {
    console.error(
      `[Cache] Failed to get cached activity for ${owner}/${name}:`,
      error,
    );
    return null;
  }
}

/**
 * Set cached activity data for a repository
 */
export async function setCachedActivity(
  owner: string,
  name: string,
  data: RepoActivityData,
): Promise<void> {
  try {
    const key = `activity:${owner}/${name}`;
    // Store as JSON string
    await redis.set(key, JSON.stringify(data), { ex: CACHE_TTL });
    console.log(`[Cache] Cached activity for ${owner}/${name}`);
  } catch (error) {
    console.error(
      `[Cache] Failed to cache activity for ${owner}/${name}:`,
      error,
    );
  }
}

/**
 * Clear cached activity data for a repository
 */
export async function clearCachedActivity(
  owner: string,
  name: string,
): Promise<void> {
  try {
    const key = `activity:${owner}/${name}`;
    await redis.del(key);
    console.log(`[Cache] Cleared cache for ${owner}/${name}`);
  } catch (error) {
    console.error(`[Cache] Failed to clear cache for ${owner}/${name}:`, error);
  }
}
