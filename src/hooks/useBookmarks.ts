import { useState, useEffect, useCallback } from "react";
import { db, type Bookmark } from "~/lib/storage";
import type { GitHubRepository } from "~/types/github";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookmarks on mount
  useEffect(() => {
    void loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const allBookmarks = await db.getAllBookmarks();
      setBookmarks(allBookmarks);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = useCallback(
    (repoId: string): boolean => {
      return bookmarks.some((b) => b.id === repoId);
    },
    [bookmarks],
  );

  const addBookmark = async (
    repository: GitHubRepository,
    notes?: string,
    tags: string[] = [],
  ) => {
    try {
      const bookmark: Bookmark = {
        id: repository.id,
        repository,
        notes,
        tags,
        createdAt: Date.now(),
      };

      await db.addBookmark(bookmark);
      setBookmarks((prev) => [bookmark, ...prev]);
    } catch (error) {
      console.error("Error adding bookmark:", error);
      throw error;
    }
  };

  const removeBookmark = async (repoId: string) => {
    try {
      await db.removeBookmark(repoId);
      setBookmarks((prev) => prev.filter((b) => b.id !== repoId));
    } catch (error) {
      console.error("Error removing bookmark:", error);
      throw error;
    }
  };

  const updateBookmark = async (
    repoId: string,
    updates: { notes?: string; tags?: string[] },
  ) => {
    try {
      const existing = await db.getBookmark(repoId);
      if (!existing) return;

      const updated: Bookmark = {
        ...existing,
        notes: updates.notes ?? existing.notes,
        tags: updates.tags ?? existing.tags,
      };

      await db.addBookmark(updated);
      setBookmarks((prev) => prev.map((b) => (b.id === repoId ? updated : b)));
    } catch (error) {
      console.error("Error updating bookmark:", error);
      throw error;
    }
  };

  return {
    bookmarks,
    loading,
    isBookmarked,
    addBookmark,
    removeBookmark,
    updateBookmark,
    refresh: loadBookmarks,
  };
}
