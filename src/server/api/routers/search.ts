import { z } from "zod";
import { createTRPCRouter } from "~/server/api/trpc";
import { publicProcedure } from "../procedure";
import { githubClient } from "~/lib/github/client";
import { buildGitHubSearchQuery } from "~/lib/github/query-builder";
import type { GitHubRepository } from "~/lib/github/client";

const SearchFiltersSchema = z.object({
  languages: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  libraries: z.array(z.string()).default([]),
  experienceLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .nullable()
    .optional(),
  yearsOfExperience: z.number().nullable().optional(),
  projectAge: z
    .enum(["very_new", "new", "established", "mature"])
    .nullable()
    .optional(),
  competitionLevel: z.enum(["low", "medium", "high"]).nullable().optional(),
  activityLevel: z
    .enum(["very_active", "active", "moderate", "inactive"])
    .nullable()
    .optional(),
  minStars: z.number().nullable().optional(),
  maxStars: z.number().nullable().optional(),
  minForks: z.number().nullable().optional(),
  maxForks: z.number().nullable().optional(),
  minContributors: z.number().nullable().optional(),
  maxContributors: z.number().nullable().optional(),
  hasGoodFirstIssues: z.boolean().default(false),
  hasHelpWanted: z.boolean().default(false),
  minOpenIssues: z.number().nullable().optional(),
  issueTypes: z.array(z.string()).default([]),
  maintainerResponsiveness: z
    .enum(["high", "medium", "low", "any"])
    .default("any"),
  hasMentor: z.boolean().default(false),
  hasContributingGuide: z.boolean().default(false),
  hasCodeOfConduct: z.boolean().default(false),
  hasIssueTemplates: z.boolean().default(false),
  isWelcoming: z.boolean().default(false),
  topics: z.array(z.string()).default([]),
  licenses: z.array(z.string()).default([]),
  lastPushedWithin: z
    .enum(["7days", "30days", "90days", "180days", "365days"])
    .nullable()
    .optional(),
});

export interface EnrichedRepository extends GitHubRepository {
  missingFilters: {
    frameworks: string[];
    libraries: string[];
    contributingGuide: boolean;
    codeOfConduct: boolean;
    issueTemplates: boolean;
  };
}

export const searchRouter = createTRPCRouter({
  repositories: publicProcedure
    .input(
      z.object({
        filters: SearchFiltersSchema,
        page: z.number().default(1),
        perPage: z.number().min(1).max(100).default(20),
        cursor: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        // Build GitHub search query
        const searchQuery = buildGitHubSearchQuery(input.filters);

        console.log("GitHub Search Query:", searchQuery);

        // Search GitHub
        const result = await githubClient.searchRepositories(
          searchQuery,
          input.perPage,
          input.cursor ?? undefined,
        );

        console.log(
          `Fetched ${result.repositories.length} repositories from GitHub`,
        );

        // Enrich repositories with missing filter information
        const enrichedRepos: EnrichedRepository[] = result.repositories.map(
          (repo) => {
            const repoText =
              `${repo.description ?? ""} ${repo.topics.join(" ")} ${repo.languages.map((l) => l.name).join(" ")}`.toLowerCase();

            // Check which frameworks are missing
            const missingFrameworks = input.filters.frameworks.filter(
              (fw) => !repoText.includes(fw.toLowerCase()),
            );

            // Check which libraries are missing
            const missingLibraries = input.filters.libraries.filter(
              (lib) => !repoText.includes(lib.toLowerCase()),
            );

            return {
              ...repo,
              missingFilters: {
                frameworks: missingFrameworks,
                libraries: missingLibraries,
                contributingGuide:
                  input.filters.hasContributingGuide &&
                  !repo.hasContributingFile,
                codeOfConduct:
                  input.filters.hasCodeOfConduct && !repo.hasCodeOfConduct,
                issueTemplates:
                  input.filters.hasIssueTemplates && !repo.hasIssueTemplate,
              },
            };
          },
        );

        console.log(`Returning ${enrichedRepos.length} enriched repositories`);

        return {
          repositories: enrichedRepos,
          totalCount: result.totalCount,
          hasNextPage: result.hasNextPage,
          endCursor: result.endCursor,
        };
      } catch (error) {
        console.error("Error searching repositories:", error);
        throw new Error("Failed to search repositories");
      }
    }),
});
