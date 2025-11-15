"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { db, type SearchHistoryItem } from "~/lib/storage";

interface SearchHistoryContextType {
  history: SearchHistoryItem[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const SearchHistoryContext = createContext<
  SearchHistoryContextType | undefined
>(undefined);

export function SearchHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const items = await db.getSearchHistory(20);
      setHistory(items);
    } catch (error) {
      console.error("Error loading search history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const items = await db.getSearchHistory(20);
      setHistory(items);
    } catch (error) {
      console.error("Error refreshing search history:", error);
    }
  }, []);

  // Load history only once on mount
  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <SearchHistoryContext.Provider value={{ history, loading, refresh }}>
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistoryContext() {
  const context = useContext(SearchHistoryContext);
  if (context === undefined) {
    throw new Error(
      "useSearchHistoryContext must be used within a SearchHistoryProvider",
    );
  }
  return context;
}
