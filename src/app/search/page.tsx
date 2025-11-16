"use client";

import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";

// hooks
import { useSearchParams, useRouter } from "next/navigation";
import { useSearchHistoryContext } from "~/contexts/SearchHistoryContext";

// icons
import { Loader2Icon, SearchIcon } from "lucide-react";

// libs
import { searchParamsToFilters } from "~/lib/nlp/utils";
import {
  getCachedSearchResults,
  cacheSearchResults,
  addToSearchHistory,
  db,
} from "~/lib/storage";

// types
import type { SearchFilters } from "~/types";
import type { EnrichedRepository } from "~/server/api/routers/search";

// components
import {
  RepositoryCard,
  SearchFiltersPanel,
  SortOptions,
  type SortOption,
} from "~/components/feature";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/common";
import { Skeleton } from "~/components/ui/skeleton";

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh: refreshHistory } = useSearchHistoryContext();
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("stars");
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [cachedResults, setCachedResults] = useState<{
    repositories: EnrichedRepository[];
    totalCount: number;
  } | null>(null);
  const [usingCache, setUsingCache] = useState(false);
  const [pledgeSigned, setPledgeSigned] = useState(false);
  const [pledgeLoading, setPledgeLoading] = useState(true);

  // Load pledge status and preferences
  useEffect(() => {
    const loadData = async () => {
      try {
        setPledgeLoading(true);

        // Load pledge status
        const pledgeStatus = await db.getPledgeStatus();
        setPledgeSigned(pledgeStatus?.signed ?? false);

        // Load preferences
        const prefs = await db.getPreferences();
        if (prefs) {
          setSortBy(prefs.sortBy);
          setResultsPerPage(prefs.resultsPerPage);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setPledgeLoading(false);
      }
    };

    void loadData();
  }, []);

  useEffect(() => {
    const parsedFilters = searchParamsToFilters(searchParams);
    setFilters(parsedFilters as SearchFilters);
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

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

  const { data, isLoading, error } = api.search.repositories.useQuery(
    {
      filters: filters!,
      perPage: resultsPerPage,
    },
    {
      enabled: !!filters && !usingCache && pledgeSigned,
    },
  );

  useEffect(() => {
    if (data && filters && query) {
      void cacheSearchResults(
        query,
        filters,
        data.repositories,
        data.totalCount,
      );
      void addToSearchHistory(query, filters).then(() => {
        void refreshHistory();
      });
    }
  }, [data, filters, query, refreshHistory]);

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

  const handleReadPledge = () => {
    // Get current URL path with search params
    const currentPath = window.location.pathname + window.location.search;
    const encodedPath = encodeURIComponent(currentPath);
    router.push(`/open-source-pledge?redirectTo=${encodedPath}`);
  };

  if (pledgeLoading || !filters) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center py-8">
        <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show pledge requirement if not signed
  if (!pledgeSigned) {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-card flex items-center justify-between gap-9 rounded-lg border p-6">
            <div>
              <p className="text-sm font-medium">Open Source Pledge</p>
              <p className="text-muted-foreground text-sm">
                Please read and sign the open-source pledge before using this
                tool.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleReadPledge}>
              Read the pledge
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  let displayData = usingCache ? cachedResults : data;

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
    <Container className="flex flex-col gap-9">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between">
          <div>
            <h1 className="text-lg font-semibold">Search Results</h1>
            {query && (
              <p className="text-muted-foreground mt-1 text-sm">
                <span className="font-medium">{query}</span>
                {usingCache && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                    (cached)
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              {usingCache && (
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  Refresh
                </Button>
              )}
              <Button onClick={handleNewSearch} variant="outline" size="sm">
                <SearchIcon className="mr-2 h-4 w-4" />
                New Search
              </Button>
            </div>
          </div>
        </div>
        <SearchFiltersPanel filters={filters} onClearAll={handleClearFilters} />
      </div>

      {isLoading && !usingCache && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex w-full flex-col gap-2 rounded-lg border p-3"
            >
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-5 w-[500px]" />
            </div>
          ))}
        </div>
      )}

      {error && !usingCache && (
        <div className="bg-card flex justify-between gap-9 rounded-lg border p-3">
          <div>
            <p className="text-destructive text-sm">Error in loading results</p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
          <Button onClick={handleNewSearch} variant="secondary" size="smaller">
            Try Again
          </Button>
        </div>
      )}

      {displayData && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Found {displayData.totalCount.toLocaleString()}{" "}
              {displayData.totalCount === 1 ? "repository" : "repositories"}
            </p>
            <SortOptions value={sortBy} onChange={setSortBy} />
          </div>

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
        </div>
      )}
    </Container>
  );
};

export default SearchPage;
