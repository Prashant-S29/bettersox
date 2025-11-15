"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

// icons
import { ArrowUpIcon, Loader2Icon } from "lucide-react";

// components
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "~/components/ui/input-group";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

// lib
import { queryParser, filtersToSearchParams } from "~/lib/nlp";
import type { SearchFilters } from "~/types";
import { categories, exampleQueries } from "./data";
import { db } from "~/lib/storage";

// tRPC
import { api } from "~/trpc/react";

interface ParsedResult {
  filters: SearchFilters;
  summary: string;
}

export const NLPSearchBar: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [defaultLanguages, setDefaultLanguages] = useState<string[]>([]);
  const [defaultFrameworks, setDefaultFrameworks] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await db.getPreferences();
        if (prefs) {
          setDefaultLanguages(prefs.defaultLanguages);
          setDefaultFrameworks(prefs.defaultFrameworks);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    void loadPreferences();
  }, []);

  const realtimeParsed = useMemo(() => {
    if (!query.trim()) return null;
    return queryParser.parse(query);
  }, [query]);

  const detectedCategories = useMemo(() => {
    if (!realtimeParsed) return new Set<string>();
    return queryParser.getDetectedCategories(realtimeParsed.matches);
  }, [realtimeParsed]);

  const parseQueryMutation = api.query.parseQuery.useMutation({
    onSuccess: (data) => {
      // Merge AI-parsed filters with default preferences
      const mergedFilters: SearchFilters = {
        ...data.filters,
        languages: [
          ...new Set([...defaultLanguages, ...data.filters.languages]),
        ],
        frameworks: [
          ...new Set([...defaultFrameworks, ...data.filters.frameworks]),
        ],
      };

      setParsedResult({
        ...data,
        filters: mergedFilters,
      });
    },
    onError: (error) => {
      console.error("Failed to parse query:", error);
    },
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setQuery(e.target.value);
    },
    [],
  );

  const handleParse = useCallback(() => {
    if (!query.trim()) return;
    parseQueryMutation.mutate({ query });
  }, [query, parseQueryMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        handleParse();
      }
    },
    [handleParse],
  );

  const handleEdit = useCallback(() => {
    setParsedResult(null);
  }, []);

  const handleContinue = useCallback(() => {
    if (!parsedResult) return;

    const params = filtersToSearchParams(parsedResult.filters);
    params.set("q", query);

    router.push(`/search?${params.toString()}`);
  }, [parsedResult, query, router]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  if (parsedResult) {
    return (
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border px-6 py-5">
          <div>
            <p className="text-sm font-medium">
              I am looking for an open source project...
            </p>
            <p className="text-muted-foreground text-sm">
              {parsedResult.summary}
            </p>
          </div>

          {(parsedResult.filters.languages?.length > 0 ||
            parsedResult.filters.frameworks?.length > 0 ||
            parsedResult.filters.libraries?.length > 0) && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {parsedResult.filters.languages?.map((lang) => (
                  <Badge key={lang} variant="secondary">
                    {lang}
                    {defaultLanguages.includes(lang) && (
                      <span className="ml-1 text-xs opacity-60">(default)</span>
                    )}
                  </Badge>
                ))}
                {parsedResult.filters.frameworks?.map((fw) => (
                  <Badge key={fw} variant="secondary">
                    {fw}
                    {defaultFrameworks.includes(fw) && (
                      <span className="ml-1 text-xs opacity-60">(default)</span>
                    )}
                  </Badge>
                ))}
                {parsedResult.filters.libraries?.map((lib) => (
                  <Badge key={lib} variant="secondary">
                    {lib}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {parsedResult.filters.experienceLevel && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Experience Level</p>
              <div className="flex flex-wrap gap-2">
                {parsedResult.filters.experienceLevel && (
                  <Badge variant="secondary">
                    {parsedResult.filters.experienceLevel}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {(parsedResult.filters.projectAge ??
            parsedResult.filters.competitionLevel ??
            parsedResult.filters.activityLevel) && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Project Characteristics</p>
              <div className="flex flex-wrap gap-2">
                {parsedResult.filters.projectAge && (
                  <Badge variant="secondary">
                    Age: {parsedResult.filters.projectAge}
                  </Badge>
                )}
                {parsedResult.filters.competitionLevel && (
                  <Badge variant="secondary">
                    Competition: {parsedResult.filters.competitionLevel}
                  </Badge>
                )}
                {parsedResult.filters.activityLevel && (
                  <Badge variant="secondary">
                    Activity: {parsedResult.filters.activityLevel}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {(parsedResult.filters.minStars ??
            parsedResult.filters.maxStars ??
            parsedResult.filters.minContributors ??
            parsedResult.filters.maxContributors) && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Metrics</p>
              <div className="flex flex-wrap gap-2">
                {parsedResult.filters.minStars && (
                  <Badge variant="secondary">
                    Min Stars: {parsedResult.filters.minStars}
                  </Badge>
                )}
                {parsedResult.filters.maxStars && (
                  <Badge variant="secondary">
                    Max Stars: {parsedResult.filters.maxStars}
                  </Badge>
                )}
                {parsedResult.filters.minContributors && (
                  <Badge variant="secondary">
                    Min Contributors: {parsedResult.filters.minContributors}
                  </Badge>
                )}
                {parsedResult.filters.maxContributors && (
                  <Badge variant="secondary">
                    Max Contributors: {parsedResult.filters.maxContributors}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(parsedResult.filters.hasGoodFirstIssues ||
              parsedResult.filters.hasHelpWanted ||
              parsedResult.filters.issueTypes.length > 0) && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">Issues</p>

                <div className="flex flex-wrap gap-2">
                  {parsedResult.filters.hasGoodFirstIssues && (
                    <Badge variant="secondary">Good First Issues</Badge>
                  )}
                  {parsedResult.filters.hasHelpWanted && (
                    <Badge variant="secondary">Help Wanted</Badge>
                  )}
                  {parsedResult.filters.issueTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(parsedResult.filters.hasContributingGuide ||
              parsedResult.filters.hasCodeOfConduct ||
              parsedResult.filters.hasMentor ||
              parsedResult.filters.isWelcoming) && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">Community Features</p>
                <div className="flex flex-wrap gap-2">
                  {parsedResult.filters.hasContributingGuide && (
                    <Badge variant="secondary">Contributing Guide</Badge>
                  )}
                  {parsedResult.filters.hasCodeOfConduct && (
                    <Badge variant="secondary">Code of Conduct</Badge>
                  )}
                  {parsedResult.filters.hasMentor && (
                    <Badge variant="secondary">Has Mentor</Badge>
                  )}
                  {parsedResult.filters.isWelcoming && (
                    <Badge variant="secondary">Welcoming Community</Badge>
                  )}
                </div>
              </div>
            )}

            {parsedResult.filters.topics.length > 0 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {parsedResult.filters.topics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {parsedResult.filters.licenses.length > 0 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">Licenses</p>
                <div className="flex flex-wrap gap-2">
                  {parsedResult.filters.licenses.map((license) => (
                    <Badge key={license} variant="secondary">
                      {license}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {parsedResult.filters.lastPushedWithin && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">Activity</p>
                <Badge variant="secondary">
                  Updated within {parsedResult.filters.lastPushedWithin}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button onClick={handleEdit} size="sm" variant="ghost">
              Edit Query
            </Button>
            <Button onClick={handleContinue} size="sm">
              Continue to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <InputGroup>
        <InputGroupTextarea
          ref={textareaRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="I am looking for an open source project..."
          disabled={parseQueryMutation.isPending}
        />

        <InputGroupAddon
          align="block-end"
          className="mt-2 flex items-start justify-between"
        >
          <div className="flex flex-wrap gap-1">
            {categories.map((category, index) => {
              const isDetected = detectedCategories.has(category);
              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className={isDetected ? "border-primary border" : ""}
                >
                  {category}
                </Badge>
              );
            })}
          </div>
          <InputGroupButton
            onClick={handleParse}
            disabled={!query.trim() || parseQueryMutation.isPending}
            variant="default"
            className="rounded-full"
            size="icon-xs"
          >
            {parseQueryMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="h-4 w-4" />
            )}
            <span className="sr-only">Parse Query</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {parseQueryMutation.isError && (
        <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
          <p className="text-destructive text-sm">
            Failed to parse your query. Please try again.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">Try an example:</p>
        <div className="flex flex-col">
          {exampleQueries.map((exampleQuery, index) => (
            <div key={index}>
              <div
                role="button"
                className="hover:bg-sidebar-accent cursor-pointer rounded-md px-3 py-2 text-sm"
                onClick={() => setQuery(exampleQuery)}
              >
                {exampleQuery}
              </div>
              {index !== exampleQueries.length - 1 && (
                <div className="bg-border my-1 h-px w-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
