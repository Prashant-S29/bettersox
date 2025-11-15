import { db } from "./db";
import type { CachedSearch, SearchHistoryItem } from "./db";
import type { SearchFilters } from "~/types";
import type { GitHubRepository } from "~/lib/github/client";

// Cache expiration time (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Generate a unique ID for a search based on query + filters
 */
export function generateSearchId(
  query: string,
  filters: SearchFilters,
): string {
  const filterStr = JSON.stringify(filters, Object.keys(filters).sort());
  const combined = `${query}:${filterStr}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `search_${Math.abs(hash).toString(36)}`;
}

/**
 * Get cached search results if available and not expired
 */
export async function getCachedSearchResults(
  query: string,
  filters: SearchFilters,
): Promise<{ results: GitHubRepository[]; totalCount: number } | null> {
  try {
    const searchId = generateSearchId(query, filters);
    const cached = await db.getCachedSearch(searchId);

    if (cached) {
      console.log(`Cache hit for search: ${searchId}`);
      return {
        results: cached.results,
        totalCount: cached.totalCount,
      };
    }

    console.log(`Cache miss for search: ${searchId}`);
    return null;
  } catch (error) {
    console.error("Error getting cached search:", error);
    return null;
  }
}

/**
 * Cache search results
 */
export async function cacheSearchResults(
  query: string,
  filters: SearchFilters,
  results: GitHubRepository[],
  totalCount: number,
): Promise<void> {
  try {
    const searchId = generateSearchId(query, filters);
    const now = Date.now();

    const cached: CachedSearch = {
      id: searchId,
      query,
      filters,
      results,
      totalCount,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    };

    await db.setCachedSearch(cached);

    // Also save individual repositories for offline access
    await db.saveRepositories(results);

    console.log(`Cached search results: ${searchId}`);
  } catch (error) {
    console.error("Error caching search results:", error);
  }
}

/**
 * Add search to history
 */
export async function addToSearchHistory(
  query: string,
  filters: SearchFilters,
): Promise<void> {
  try {
    const searchId = generateSearchId(query, filters);

    const historyItem: SearchHistoryItem = {
      id: searchId,
      query,
      filters,
      timestamp: Date.now(),
    };

    await db.addSearchHistory(historyItem);
    console.log(`Added to search history: ${searchId}`);
  } catch (error) {
    console.error("Error adding to search history:", error);
  }
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    await db.clearExpiredCache();
    console.log("Cleared expired cache entries");
  } catch (error) {
    console.error("Error clearing expired cache:", error);
  }
}

/**
 * Initialize cache cleanup on app start
 */
export function initCacheCleanup(): void {
  // Clear expired cache on load
  void clearExpiredCache();

  // Set up periodic cleanup (every hour)
  setInterval(
    () => {
      void clearExpiredCache();
    },
    60 * 60 * 1000,
  );
}
