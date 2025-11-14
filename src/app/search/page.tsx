"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { searchParamsToFilters } from "~/lib/nlp/utils";
import { RepositoryCard, SearchFiltersPanel } from "~/components/feature";
import { Button } from "~/components/ui/button";
import type { SearchFilters } from "~/types";

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [query, setQuery] = useState("");

  // Parse filters from URL on mount
  useEffect(() => {
    const parsedFilters = searchParamsToFilters(searchParams);
    setFilters(parsedFilters as SearchFilters);
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Fetch repositories using tRPC
  const { data, isLoading, error } = api.search.repositories.useQuery(
    {
      filters: filters!,
      perPage: 20,
    },
    {
      enabled: !!filters,
    },
  );

  const handleClearFilters = () => {
    router.push("/");
  };

  const handleNewSearch = () => {
    router.push("/");
  };

  if (!filters) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center py-8">
        <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
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
              </p>
            )}
          </div>
          <Button onClick={handleNewSearch} variant="outline">
            <SearchIcon className="mr-2 h-4 w-4" />
            New Search
          </Button>
        </div>

        {/* Filters Panel */}
        <SearchFiltersPanel filters={filters} onClearAll={handleClearFilters} />
      </div>

      {/* Loading State */}
      {isLoading && (
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
      {error && (
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
      {data && !isLoading && (
        <>
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Found {data.totalCount.toLocaleString()} repositories
            </p>
          </div>

          {/* Repository List */}
          {data.repositories.length > 0 ? (
            <div className="space-y-4">
              {data.repositories.map((repo) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}

              {/* Load More */}
              {data.hasNextPage && (
                <div className="flex justify-center pt-6">
                  <Button variant="outline" disabled>
                    Load More (Coming Soon)
                  </Button>
                </div>
              )}
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
