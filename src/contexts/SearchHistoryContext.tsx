"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useSearchHistory } from "~/hooks";

interface SearchHistoryContextType {
  history: ReturnType<typeof useSearchHistory>["history"];
  loading: ReturnType<typeof useSearchHistory>["loading"];
  refresh: () => void;
}

const SearchHistoryContext = createContext<
  SearchHistoryContextType | undefined
>(undefined);

export function SearchHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { history, loading, refresh } = useSearchHistory(20);

  const refreshHistory = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <SearchHistoryContext.Provider
      value={{ history, loading, refresh: refreshHistory }}
    >
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
