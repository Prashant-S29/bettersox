"use client";

import React from "react";

// types
import type { EnrichedRepository } from "~/types/github";

// hooks
import { useRouter } from "next/navigation";
import { useBookmarks } from "~/hooks";

// components
import { Button } from "~/components/ui/button";
import { RepositoryCard } from "~/components/feature";
import { Container } from "~/components/common";
import { Skeleton } from "~/components/ui/skeleton";

const BookmarksPage: React.FC = () => {
  const router = useRouter();
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all bookmarks?")) {
      try {
        await Promise.all(bookmarks.map((b) => removeBookmark(b.id)));
      } catch (error) {
        console.error("Error clearing bookmarks:", error);
      }
    }
  };

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Bookmarks</h1>
          <p className="text-muted-foreground text-sm">
            {bookmarks.length}{" "}
            {bookmarks.length === 1 ? "repository" : "repositories"} saved
          </p>
        </div>

        {bookmarks.length > 0 && (
          <Button onClick={handleClearAll} variant="outline" size="sm">
            Clear All
          </Button>
        )}
      </div>

      {loading ? (
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
      ) : (
        <>
          {bookmarks.length > 0 ? (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => {
                const enrichedRepo: EnrichedRepository = {
                  ...bookmark.repository,
                  missingFilters: {
                    frameworks: [],
                    libraries: [],
                    contributingGuide: false,
                    codeOfConduct: false,
                    issueTemplates: false,
                  },

                };

                return (
                  <RepositoryCard key={bookmark.id} repository={enrichedRepo} />
                );
              })}
            </div>
          ) : (
            <div className="bg-sidebar-accent/50 flex items-center justify-between rounded-md border px-5 py-3">
              <p className="text-sm font-medium">
                You have no bookmarks yet. Start by searching for repositories
                and adding them to your bookmarks.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
              >
                New Search
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default BookmarksPage;
