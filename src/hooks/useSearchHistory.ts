'use client'

import { useState, useEffect } from "react";
import { db, type SearchHistoryItem } from "~/lib/storage";

export function useSearchHistory(limit = 10) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [limit]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const items = await db.getSearchHistory(limit);
      setHistory(items);
    } catch (error) {
      console.error("Error loading search history:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await db.clearSearchHistory();
      setHistory([]);
    } catch (error) {
      console.error("Error clearing search history:", error);
      throw error;
    }
  };

  return {
    history,
    loading,
    clearHistory,
    refresh: loadHistory,
  };
}
