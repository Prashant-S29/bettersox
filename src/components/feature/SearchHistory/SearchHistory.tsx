"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ClockIcon, TrashIcon, SearchIcon } from "lucide-react";
import { useSearchHistory } from "~/hooks";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { filtersToSearchParams } from "~/lib/nlp/utils";
import type { SearchHistoryItem } from "~/lib/storage";

export const SearchHistory: React.FC = () => {
  const router = useRouter();
  const { history, loading, clearHistory } = useSearchHistory(5);

  const handleHistoryClick = (item: SearchHistoryItem) => {
    const params = filtersToSearchParams(item.filters);
    params.set("q", item.query);
    router.push(`/search?${params.toString()}`);
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear search history?")) {
      await clearHistory();
    }
  };

  if (loading || history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <ClockIcon className="h-4 w-4" />
          Recent Searches
        </h3>
        <Button
          onClick={handleClearHistory}
          variant="ghost"
          size="sm"
          className="h-auto p-1 text-xs"
        >
          <TrashIcon className="mr-1 h-3 w-3" />
          Clear
        </Button>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => handleHistoryClick(item)}
            className="border-border hover:border-primary hover:bg-accent flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors"
          >
            <SearchIcon className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <p className="mb-1 truncate text-sm font-medium">{item.query}</p>
              <div className="flex flex-wrap gap-1">
                {item.filters.languages.slice(0, 3).map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
                {item.filters.frameworks.slice(0, 2).map((fw) => (
                  <Badge key={fw} variant="secondary" className="text-xs">
                    {fw}
                  </Badge>
                ))}
                {(item.filters.languages.length > 3 ||
                  item.filters.frameworks.length > 2) && (
                  <Badge variant="secondary" className="text-xs">
                    +more
                  </Badge>
                )}
              </div>
            </div>
            <span className="text-muted-foreground flex-shrink-0 text-xs">
              {new Date(item.timestamp).toLocaleDateString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};