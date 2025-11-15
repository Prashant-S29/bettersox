"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BookmarkIcon, Loader2Icon, TrashIcon } from "lucide-react";
import { useBookmarks } from "~/hooks";
import { Button } from "~/components/ui/button";
import { RepositoryCard } from "~/components/feature";
import type { EnrichedRepository } from "~/server/api/routers/search";

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

  if (loading) {
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
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <BookmarkIcon className="h-8 w-8" />
              Bookmarks
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {bookmarks.length}{" "}
              {bookmarks.length === 1 ? "repository" : "repositories"} saved
            </p>
          </div>

          <div className="flex gap-2">
            {bookmarks.length > 0 && (
              <Button onClick={handleClearAll} variant="outline" size="sm">
                <TrashIcon className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button onClick={() => router.push("/")} variant="default">
              New Search
            </Button>
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length > 0 ? (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => {
            // Transform bookmark repository to EnrichedRepository
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
        <div className="border-border bg-muted/30 rounded-lg border p-12 text-center">
          <BookmarkIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-lg font-semibold">No bookmarks yet</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Start bookmarking repositories to see them here
          </p>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="mt-4"
          >
            Search Repositories
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
