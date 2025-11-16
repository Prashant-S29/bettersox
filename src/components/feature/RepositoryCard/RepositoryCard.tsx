"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// icons
import {
  StarIcon,
  GitForkIcon,
  CircleDotIcon,
  ExternalLinkIcon,
  GitPullRequestIcon,
  AlertCircleIcon,
  BookmarkIcon,
  ArrowUpRight,
} from "lucide-react";

// types
import type { EnrichedRepository } from "~/server/api/routers/search";

// hooks
import { useBookmarks } from "~/hooks";

// libs
import { db } from "~/lib/storage";

// components
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

interface RepositoryCardProps {
  repository: EnrichedRepository;
  hideMissingFilters?: boolean;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  hideMissingFilters,
}) => {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [showMissingFilters, setShowMissingFilters] = useState(true);
  const bookmarked = isBookmarked(repository.id);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await db.getPreferences();
        if (prefs) {
          setShowMissingFilters(prefs.showMissingFilters);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    void loadPreferences();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleBookmarkToggle = async () => {
    try {
      setIsBookmarkLoading(true);
      if (bookmarked) {
        await removeBookmark(repository.id);
        toast.success("Removed from bookmarks");
      } else {
        await addBookmark(repository);
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
      toast.error("Failed to update bookmark");
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  // Check if any filters are missing
  const hasMissingFilters =
    repository.missingFilters.frameworks.length > 0 ||
    repository.missingFilters.libraries.length > 0 ||
    repository.missingFilters.contributingGuide ||
    repository.missingFilters.codeOfConduct ||
    repository.missingFilters.issueTemplates;

  return (
    <div className="border-border bg-card rounded-lg border p-6 transition-all">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Image
              src={repository.owner.avatarUrl}
              alt={repository.owner.login}
              className="h-6 w-6 rounded-full"
              width={50}
              height={50}
            />

            <Link
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-lg font-semibold hover:underline"
            >
              {repository.nameWithOwner}
            </Link>
            <ExternalLinkIcon className="text-muted-foreground h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleBookmarkToggle}
            disabled={isBookmarkLoading}
            className="shrink-0"
          >
            <BookmarkIcon
              className="h-4 w-4"
              fill={bookmarked ? "currentColor" : "none"}
            />
          </Button>
          <Button asChild variant="default" size="icon-sm">
            <Link
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>

      {repository.description && (
        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
          {repository.description}
        </p>
      )}

      {!hideMissingFilters && showMissingFilters && hasMissingFilters && (
        <div className="bg-sidebar-accent/50 mb-4 rounded-md border p-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="w-4" />
              <p className="text-xs font-medium">
                Missing some requested features:
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {repository.missingFilters.frameworks.map((fw) => (
                <Badge key={fw} variant="outline">
                  {fw} not found
                </Badge>
              ))}
              {repository.missingFilters.libraries.map((lib) => (
                <Badge key={lib} variant="outline">
                  {lib} not found
                </Badge>
              ))}
              {repository.missingFilters.contributingGuide && (
                <Badge variant="outline">No contributing guide</Badge>
              )}
              {repository.missingFilters.codeOfConduct && (
                <Badge variant="outline">No code of conduct</Badge>
              )}
              {repository.missingFilters.issueTemplates && (
                <Badge variant="outline">No issue templates</Badge>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-4 text-sm">
        {repository.primaryLanguage && (
          <div className="flex items-center gap-1.5">
            <CircleDotIcon
              className="h-3 w-3"
              style={{ color: repository.primaryLanguage.color }}
            />
            <span>{repository.primaryLanguage.name}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <StarIcon className="h-4 w-4" />
          <span>{formatNumber(repository.stargazerCount)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <GitForkIcon className="h-4 w-4" />
          <span>{formatNumber(repository.forkCount)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <GitPullRequestIcon className="h-4 w-4" />
          <span>{repository.openIssuesCount} open issues</span>
        </div>

        <span>Updated {formatDate(repository.pushedAt)}</span>
      </div>

      {repository.topics.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {repository.topics.slice(0, 5).map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
          {repository.topics.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{repository.topics.length - 5} more
            </Badge>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {repository.hasGoodFirstIssues && (
          <Badge variant="outline">Good First Issues</Badge>
        )}
        {repository.hasHelpWantedIssues && (
          <Badge variant="outline">Help Wanted</Badge>
        )}
        {repository.hasContributingFile && (
          <Badge variant="outline">Contributing Guide</Badge>
        )}
        {repository.hasCodeOfConduct && (
          <Badge variant="outline">Code of Conduct</Badge>
        )}
        {repository.licenseInfo && (
          <Badge variant="outline">{repository.licenseInfo.name}</Badge>
        )}
      </div>
    </div>
  );
};
