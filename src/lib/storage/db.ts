import type { GitHubRepository } from "~/lib/github/client";
import type { SearchFilters } from "~/types";

const DB_NAME = "bettersox-db";
const DB_VERSION = 1;

// Store names
const STORES = {
  REPOSITORIES: "repositories",
  SEARCH_CACHE: "search_cache",
  SEARCH_HISTORY: "search_history",
  BOOKMARKS: "bookmarks",
  USER_PREFERENCES: "user_preferences",
} as const;

export interface CachedSearch {
  id: string; // Hash of search query + filters
  query: string;
  filters: SearchFilters;
  results: GitHubRepository[];
  totalCount: number;
  timestamp: number;
  expiresAt: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: number;
}

export interface Bookmark {
  id: string; // Repository ID
  repository: GitHubRepository;
  notes?: string;
  tags: string[];
  createdAt: number;
}

export interface UserPreferences {
  id: "preferences"; // Singleton
  theme: "light" | "dark" | "system";
  defaultLanguages: string[];
  defaultFrameworks: string[];
  sortBy: "stars" | "forks" | "updated" | "created";
  resultsPerPage: number;
  showMissingFilters: boolean;
}

class BetterSOXDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Repositories store
        if (!db.objectStoreNames.contains(STORES.REPOSITORIES)) {
          const repoStore = db.createObjectStore(STORES.REPOSITORIES, {
            keyPath: "id",
          });
          repoStore.createIndex("nameWithOwner", "nameWithOwner", {
            unique: true,
          });
          repoStore.createIndex("stargazerCount", "stargazerCount");
          repoStore.createIndex("updatedAt", "updatedAt");
        }

        // Search cache store
        if (!db.objectStoreNames.contains(STORES.SEARCH_CACHE)) {
          const cacheStore = db.createObjectStore(STORES.SEARCH_CACHE, {
            keyPath: "id",
          });
          cacheStore.createIndex("timestamp", "timestamp");
          cacheStore.createIndex("expiresAt", "expiresAt");
        }

        // Search history store
        if (!db.objectStoreNames.contains(STORES.SEARCH_HISTORY)) {
          const historyStore = db.createObjectStore(STORES.SEARCH_HISTORY, {
            keyPath: "id",
          });
          historyStore.createIndex("timestamp", "timestamp");
        }

        // Bookmarks store
        if (!db.objectStoreNames.contains(STORES.BOOKMARKS)) {
          const bookmarkStore = db.createObjectStore(STORES.BOOKMARKS, {
            keyPath: "id",
          });
          bookmarkStore.createIndex("createdAt", "createdAt");
        }

        // User preferences store
        if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
          db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: "id" });
        }
      };
    });

    return this.initPromise;
  }

  // ============================================================================
  // SEARCH CACHE METHODS
  // ============================================================================

  async getCachedSearch(searchId: string): Promise<CachedSearch | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEARCH_CACHE, "readonly");
      const store = transaction.objectStore(STORES.SEARCH_CACHE);
      const request = store.get(searchId);

      request.onsuccess = () => {
        const cached = request.result as CachedSearch | undefined;

        // Check if cache is expired
        if (cached && cached.expiresAt < Date.now()) {
          // Cache expired, delete it
          this.deleteCachedSearch(searchId);
          resolve(null);
        } else {
          resolve(cached ?? null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async setCachedSearch(cached: CachedSearch): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEARCH_CACHE, "readwrite");
      const store = transaction.objectStore(STORES.SEARCH_CACHE);
      const request = store.put(cached);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCachedSearch(searchId: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEARCH_CACHE, "readwrite");
      const store = transaction.objectStore(STORES.SEARCH_CACHE);
      const request = store.delete(searchId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredCache(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEARCH_CACHE, "readwrite");
      const store = transaction.objectStore(STORES.SEARCH_CACHE);
      const index = store.index("expiresAt");
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // SEARCH HISTORY METHODS
  // ============================================================================

  async addSearchHistory(item: SearchHistoryItem): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEARCH_HISTORY, "readwrite");
      const store = transaction.objectStore(STORES.SEARCH_HISTORY);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSearchHistory(limit = 10): Promise<SearchHistoryItem[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEARCH_HISTORY, "readonly");
      const store = transaction.objectStore(STORES.SEARCH_HISTORY);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "prev"); // Most recent first

      const results: SearchHistoryItem[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value as SearchHistoryItem);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clearSearchHistory(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEARCH_HISTORY, "readwrite");
      const store = transaction.objectStore(STORES.SEARCH_HISTORY);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // BOOKMARKS METHODS
  // ============================================================================

  async addBookmark(bookmark: Bookmark): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.BOOKMARKS, "readwrite");
      const store = transaction.objectStore(STORES.BOOKMARKS);
      const request = store.put(bookmark);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async removeBookmark(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.BOOKMARKS, "readwrite");
      const store = transaction.objectStore(STORES.BOOKMARKS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getBookmark(id: string): Promise<Bookmark | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.BOOKMARKS, "readonly");
      const store = transaction.objectStore(STORES.BOOKMARKS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.BOOKMARKS, "readonly");
      const store = transaction.objectStore(STORES.BOOKMARKS);
      const index = store.index("createdAt");
      const request = index.openCursor(null, "prev"); // Most recent first

      const results: Bookmark[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value as Bookmark);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // USER PREFERENCES METHODS
  // ============================================================================

  async getPreferences(): Promise<UserPreferences | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.USER_PREFERENCES, "readonly");
      const store = transaction.objectStore(STORES.USER_PREFERENCES);
      const request = store.get("preferences");

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  async setPreferences(preferences: UserPreferences): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.USER_PREFERENCES, "readwrite");
      const store = transaction.objectStore(STORES.USER_PREFERENCES);
      const request = store.put(preferences);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updatePreferences(
    updates: Partial<Omit<UserPreferences, "id">>,
  ): Promise<void> {
    const current = await this.getPreferences();
    const updated: UserPreferences = {
      id: "preferences",
      theme: updates.theme ?? current?.theme ?? "system",
      defaultLanguages:
        updates.defaultLanguages ?? current?.defaultLanguages ?? [],
      defaultFrameworks:
        updates.defaultFrameworks ?? current?.defaultFrameworks ?? [],
      sortBy: updates.sortBy ?? current?.sortBy ?? "stars",
      resultsPerPage: updates.resultsPerPage ?? current?.resultsPerPage ?? 20,
      showMissingFilters:
        updates.showMissingFilters ?? current?.showMissingFilters ?? true,
    };

    await this.setPreferences(updated);
  }

  // ============================================================================
  // REPOSITORIES METHODS (for offline access)
  // ============================================================================

  async saveRepository(repository: GitHubRepository): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.REPOSITORIES, "readwrite");
      const store = transaction.objectStore(STORES.REPOSITORIES);
      const request = store.put(repository);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveRepositories(repositories: GitHubRepository[]): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.REPOSITORIES, "readwrite");
      const store = transaction.objectStore(STORES.REPOSITORIES);

      let completed = 0;
      const total = repositories.length;

      repositories.forEach((repo) => {
        const request = store.put(repo);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      if (total === 0) resolve();
    });
  }

  async getRepository(id: string): Promise<GitHubRepository | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.REPOSITORIES, "readonly");
      const store = transaction.objectStore(STORES.REPOSITORIES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const db = new BetterSOXDB();
