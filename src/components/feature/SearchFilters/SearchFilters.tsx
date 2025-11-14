"use client";

import React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { XIcon } from "lucide-react";
import type { SearchFilters } from "~/types";

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onClearAll: () => void;
}

export const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  filters,
  onClearAll,
}) => {
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
    <div className="border-border bg-muted/30 rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Active Filters</h3>
        <Button onClick={onClearAll} variant="ghost" size="sm">
          <XIcon className="mr-1 h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {/* Tech Stack */}
        {(filters.languages.length > 0 ||
          filters.frameworks.length > 0 ||
          filters.libraries.length > 0) && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Tech Stack
            </p>
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

        {/* Experience Level */}
        {filters.experienceLevel && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Experience Level
            </p>
            <Badge variant="secondary">{filters.experienceLevel}</Badge>
          </div>
        )}

        {/* Project Characteristics */}
        {(filters.projectAge ??
          filters.competitionLevel ??
          filters.activityLevel) && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
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

        {/* Metrics */}
        {(filters.minStars ??
          filters.maxStars ??
          filters.minContributors ??
          filters.maxContributors) && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Metrics
            </p>
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

        {/* Issues & Community */}
        {(filters.hasGoodFirstIssues ||
          filters.hasHelpWanted ||
          filters.hasContributingGuide ||
          filters.hasCodeOfConduct) && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Community Features
            </p>
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

        {/* Topics */}
        {filters.topics.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Topics
            </p>
            <div className="flex flex-wrap gap-1">
              {filters.topics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Licenses */}
        {filters.licenses?.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Licenses
            </p>
            <div className="flex flex-wrap gap-1">
              {filters.licenses.map((license) => (
                <Badge key={license} variant="secondary">
                  {license}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Time-based */}
        {filters.lastPushedWithin && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Activity
            </p>
            <Badge variant="secondary">
              Updated within {filters.lastPushedWithin}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};
