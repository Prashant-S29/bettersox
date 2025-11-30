import { z } from "zod";
import { createTRPCRouter } from "~/server/api/trpc";
import { searchProcedure } from "../procedure";
import { searchRepositories } from "~/lib/github/queries";
import { buildGitHubSearchQuery } from "~/lib/github/query-builder";
import { SearchFiltersSchema } from "~/schema";
import type { EnrichedRepository } from "~/types/github";

export const searchRouter = createTRPCRouter({
  repositories: searchProcedure
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
        // build github search query
        const searchQuery = buildGitHubSearchQuery(input.filters);

        // search github
        const result = await searchRepositories(
          searchQuery,
          input.perPage,
          input.cursor ?? undefined,
        );

        // enrich repositories with missing filter information
        const enrichedRepos: EnrichedRepository[] = result.repositories.map(
          (repo) => {
            const repoText =
              `${repo.description ?? ""} ${repo.topics.join(" ")} ${repo.languages.map((l) => l.name).join(" ")}`.toLowerCase();

            // check which frameworks are missing
            const missingFrameworks = input.filters.frameworks.filter(
              (fw) => !repoText.includes(fw.toLowerCase()),
            );

            // check which libraries are missing
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

        return {
          data: {
            repositories: enrichedRepos,
            totalCount: result.totalCount,
            hasNextPage: result.hasNextPage,
            endCursor: result.endCursor,
          },
          error: null,
          message: "repositories fetched successfully",
        };
      } catch (error) {
        console.error("[search] error searching repositories:", error);
        return {
          data: null,
          error: "failed to search repositories",
          message: "error searching repositories",
        };
      }
    }),
});
