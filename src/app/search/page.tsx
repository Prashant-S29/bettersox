"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { searchParamsToFilters } from "~/lib/nlp/utils";
import {
  RepositoryCard,
  SearchFiltersPanel,
  SortOptions,
  type SortOption,
} from "~/components/feature";
import { Button } from "~/components/ui/button";
import type { SearchFilters } from "~/types";
import type { EnrichedRepository } from "~/server/api/routers/search";
import {
  getCachedSearchResults,
  cacheSearchResults,
  addToSearchHistory,
} from "~/lib/storage";

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("stars");
  const [cachedResults, setCachedResults] = useState<{
    repositories: EnrichedRepository[];
    totalCount: number;
  } | null>(null);
  const [usingCache, setUsingCache] = useState(false);

  // Parse filters from URL on mount
  useEffect(() => {
    const parsedFilters = searchParamsToFilters(searchParams);
    setFilters(parsedFilters as SearchFilters);
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Try to get cached results first
  useEffect(() => {
    if (!filters || !query) return;

    const loadCachedResults = async () => {
      const cached = await getCachedSearchResults(query, filters);
      if (cached) {
        setCachedResults({
          repositories: cached.results as EnrichedRepository[],
          totalCount: cached.totalCount,
        });
        setUsingCache(true);
      }
    };

    void loadCachedResults();
  }, [filters, query]);

  // Fetch repositories using tRPC (only if not using cache)
  const { data, isLoading, error } = api.search.repositories.useQuery(
    {
      filters: filters!,
      perPage: 20,
    },
    {
      enabled: !!filters && !usingCache,
    },
  );

  // Cache results when they arrive
  useEffect(() => {
    if (data && filters && query) {
      void cacheSearchResults(query, filters, data.repositories, data.totalCount);
      void addToSearchHistory(query, filters);
    }
  }, [data, filters, query]);

  const handleClearFilters = () => {
    router.push("/");
  };

  const handleNewSearch = () => {
    router.push("/");
  };

  const handleRefresh = () => {
    setUsingCache(false);
    setCachedResults(null);
  };

  if (!filters) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center py-8">
        <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Use cached results if available, otherwise use fresh data
  let displayData = usingCache ? cachedResults : data;

  // Sort repositories
  if (displayData) {
    const sorted = [...displayData.repositories].sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return b.stargazerCount - a.stargazerCount;
        case "forks":
          return b.forkCount - a.forkCount;
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    displayData = {
      ...displayData,
      repositories: sorted,
    };
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Search Results</h1>
            {query && (
              <p className="text-muted-foreground mt-1 text-sm">
                Showing results for:{" "}
                <span className="font-medium">{query}</span>
                {usingCache && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                    (cached)
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {usingCache && (
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Refresh
              </Button>
            )}
            <Button onClick={handleNewSearch} variant="outline">
              <SearchIcon className="mr-2 h-4 w-4" />
              New Search
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <SearchFiltersPanel filters={filters} onClearAll={handleClearFilters} />
      </div>

      {/* Loading State */}
      {isLoading && !usingCache && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2Icon className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
            <p className="text-lg font-medium">Searching repositories...</p>
            <p className="text-muted-foreground text-sm">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !usingCache && (
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6 text-center">
          <p className="text-destructive text-lg font-semibold">
            Error loading results
          </p>
          <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
          <Button onClick={handleNewSearch} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {displayData && (
        <>
          {/* Results Count & Sort */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Found {displayData.totalCount.toLocaleString()}{" "}
              {displayData.totalCount === 1 ? "repository" : "repositories"}
            </p>
            <SortOptions value={sortBy} onChange={setSortBy} />
          </div>

          {/* Repository List */}
          {displayData.repositories.length > 0 ? (
            <div className="space-y-4">
              {displayData.repositories.map((repo) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>
          ) : (
            <div className="border-border bg-muted/30 rounded-lg border p-12 text-center">
              <SearchIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-lg font-semibold">No repositories found</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Try adjusting your filters or search criteria
              </p>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
