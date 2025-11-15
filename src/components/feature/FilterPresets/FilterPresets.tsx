"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { SparklesIcon, CodeIcon, RocketIcon, HeartIcon } from "lucide-react";
import type { SearchFilters } from "~/types";
import { filtersToSearchParams } from "~/lib/nlp/utils";

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  filters: Partial<SearchFilters>;
  query: string;
}

const presets: FilterPreset[] = [
  {
    id: "beginner-friendly",
    name: "Beginner Friendly",
    description: "Perfect for first-time contributors",
    icon: <SparklesIcon className="h-5 w-5" />,
    filters: {
      experienceLevel: "beginner",
      hasGoodFirstIssues: true,
      hasContributingGuide: true,
      hasCodeOfConduct: true,
      maxStars: 10000,
      activityLevel: "active",
    },
    query: "beginner friendly projects with good first issues",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    description: "For developers with some experience",
    icon: <CodeIcon className="h-5 w-5" />,
    filters: {
      experienceLevel: "intermediate",
      minStars: 1000,
      maxStars: 50000,
      activityLevel: "active",
      hasContributingGuide: true,
    },
    query: "intermediate level projects actively maintained",
  },
  {
    id: "highly-active",
    name: "Highly Active",
    description: "Very active projects with frequent updates",
    icon: <RocketIcon className="h-5 w-5" />,
    filters: {
      activityLevel: "very_active",
      minStars: 5000,
      hasGoodFirstIssues: true,
    },
    query: "highly active projects with frequent updates",
  },
  {
    id: "welcoming-community",
    name: "Welcoming Community",
    description: "Great community support for contributors",
    icon: <HeartIcon className="h-5 w-5" />,
    filters: {
      hasContributingGuide: true,
      hasCodeOfConduct: true,
      hasIssueTemplates: true,
      isWelcoming: true,
      hasGoodFirstIssues: true,
    },
    query: "projects with welcoming communities and contributor support",
  },
];

export const FilterPresets: React.FC = () => {
  const router = useRouter();

  const handlePresetClick = (preset: FilterPreset) => {
    const params = filtersToSearchParams(preset.filters);
    params.set("q", preset.query);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-3xl">
      <h3 className="mb-4 text-sm font-semibold">Quick Filters</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className="border-border hover:border-primary hover:bg-accent group flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all"
          >
            <div className="flex w-full items-start justify-between">
              <div className="bg-primary/10 text-primary rounded-lg p-2">
                {preset.icon}
              </div>
            </div>
            <div>
              <h4 className="mb-1 font-semibold">{preset.name}</h4>
              <p className="text-muted-foreground text-sm">
                {preset.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {preset.filters.experienceLevel && (
                <Badge variant="secondary" className="text-xs">
                  {preset.filters.experienceLevel}
                </Badge>
              )}
              {preset.filters.hasGoodFirstIssues && (
                <Badge variant="secondary" className="text-xs">
                  good first issues
                </Badge>
              )}
              {preset.filters.activityLevel && (
                <Badge variant="secondary" className="text-xs">
                  {preset.filters.activityLevel}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
