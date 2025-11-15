"use client";

import React, { useState } from "react";

// icons
import { ChevronDown } from "lucide-react";

// types
import type { SearchFilters } from "~/types";

// components
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onClearAll: () => void;
}

export const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  filters,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasAnyFilters =
    filters.languages.length > 0 ||
    filters.frameworks.length > 0 ||
    filters.libraries.length > 0 ||
    filters.experienceLevel !== null ||
    filters.projectAge !== null ||
    filters.competitionLevel !== null ||
    filters.activityLevel !== null ||
    filters.minStars !== null ||
    filters.maxStars !== null ||
    filters.minContributors !== null ||
    filters.maxContributors !== null ||
    filters.hasGoodFirstIssues ||
    filters.hasHelpWanted ||
    filters.hasContributingGuide ||
    filters.hasCodeOfConduct ||
    filters.topics.length > 0 ||
    filters.licenses.length > 0 ||
    filters.lastPushedWithin !== null;

  if (!hasAnyFilters) return null;

  return (
    <div className="border-border bg-muted/30 flex flex-col rounded-lg border px-5 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Active Filters</h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClearAll}>
            Clear all
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <ChevronDown className={`${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      <div
        className={`space-y-3 ${isOpen ? "max-h-[500px]" : "max-h-0"} overflow-hidden duration-300`}
      >
        <div className="h-5 w-full" />
        {(filters.languages.length > 0 ||
          filters.frameworks.length > 0 ||
          filters.libraries.length > 0) && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">Tech Stack</p>
            <div className="flex flex-wrap gap-1">
              {filters.languages.map((lang) => (
                <Badge key={lang} variant="secondary">
                  {lang}
                </Badge>
              ))}
              {filters.frameworks.map((fw) => (
                <Badge key={fw} variant="secondary">
                  {fw}
                </Badge>
              ))}
              {filters.libraries.map((lib) => (
                <Badge key={lib} variant="secondary">
                  {lib}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {filters.experienceLevel && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">Experience Level</p>
            <Badge variant="secondary">{filters.experienceLevel}</Badge>
          </div>
        )}

        {(filters.projectAge ??
          filters.competitionLevel ??
          filters.activityLevel) && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">
              Project Characteristics
            </p>
            <div className="flex flex-wrap gap-1">
              {filters.projectAge && (
                <Badge variant="secondary">Age: {filters.projectAge}</Badge>
              )}
              {filters.competitionLevel && (
                <Badge variant="secondary">
                  Competition: {filters.competitionLevel}
                </Badge>
              )}
              {filters.activityLevel && (
                <Badge variant="secondary">
                  Activity: {filters.activityLevel}
                </Badge>
              )}
            </div>
          </div>
        )}

        {(filters.minStars ??
          filters.maxStars ??
          filters.minContributors ??
          filters.maxContributors) && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">Metrics</p>
            <div className="flex flex-wrap gap-1">
              {filters.minStars && (
                <Badge variant="secondary">Min Stars: {filters.minStars}</Badge>
              )}
              {filters.maxStars && (
                <Badge variant="secondary">Max Stars: {filters.maxStars}</Badge>
              )}
              {filters.minContributors && (
                <Badge variant="secondary">
                  Min Contributors: {filters.minContributors}
                </Badge>
              )}
              {filters.maxContributors && (
                <Badge variant="secondary">
                  Max Contributors: {filters.maxContributors}
                </Badge>
              )}
            </div>
          </div>
        )}

        {(filters.hasGoodFirstIssues ||
          filters.hasHelpWanted ||
          filters.hasContributingGuide ||
          filters.hasCodeOfConduct) && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">Community Features</p>
            <div className="flex flex-wrap gap-1">
              {filters.hasGoodFirstIssues && (
                <Badge variant="secondary">Good First Issues</Badge>
              )}
              {filters.hasHelpWanted && (
                <Badge variant="secondary">Help Wanted</Badge>
              )}
              {filters.hasContributingGuide && (
                <Badge variant="secondary">Contributing Guide</Badge>
              )}
              {filters.hasCodeOfConduct && (
                <Badge variant="secondary">Code of Conduct</Badge>
              )}
            </div>
          </div>
        )}

        {filters.topics.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">Topics</p>
            <div className="flex flex-wrap gap-1">
              {filters.topics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {filters.licenses?.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">Licenses</p>
            <div className="flex flex-wrap gap-1">
              {filters.licenses.map((license) => (
                <Badge key={license} variant="secondary">
                  {license}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {filters.lastPushedWithin && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">Activity</p>
            <Badge variant="secondary">
              Updated within {filters.lastPushedWithin}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};
