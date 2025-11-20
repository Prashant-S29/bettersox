import { createTRPCRouter } from "~/server/api/trpc";

// libs
import { buildGitHubSearchQuery } from "~/lib/github/query-builder";
import { searchRepositories } from "~/lib/github/queries";

// types
import type { GitHubRepository, ScoredRepository } from "~/types/github";

// procedure
import { publicProcedure } from "../procedure";
import { MatchInputSchema } from "~/schema";

export const matchRouter = createTRPCRouter({
  findMatches: publicProcedure
    .input(MatchInputSchema)
    .query(async ({ input }) => {
      try {
        // extract technologies by category
        const languages = input.skills
          .filter((s) => s.category === "programming_language")
          .map((s) => s.name);

        const frameworks = input.skills
          .filter((s) => s.category === "framework")
          .map((s) => s.name);

        const libraries = input.skills
          .filter((s) => s.category === "library")
          .map((s) => s.name);

        const allTechs = [...languages, ...frameworks, ...libraries];

        if (allTechs.length === 0) {
          return {
            data: {
              repositories: [],
              totalCount: 0,
            },
            error: null,
            message: "no technologies found in profile",
          };
        }

        // map experience level (expert -> advanced for search)
        const experienceLevel =
          input.experienceLevel === "expert"
            ? "advanced"
            : input.experienceLevel;

        // determine search parameters based on experience
        const baseFilters = getBaseFilters(
          experienceLevel,
          input.yearsOfExperience ?? null,
        );

        // create search queries for each technology
        const searchQueries = allTechs.slice(0, 8).map((tech) => {
          const techCategory = getTechCategory(tech, input.skills);

          return {
            tech,
            category: techCategory,
            filters: {
              ...baseFilters,
              languages: techCategory === "programming_language" ? [tech] : [],
              frameworks: techCategory === "framework" ? [tech] : [],
              libraries: techCategory === "library" ? [tech] : [],
            },
          };
        });

        // execute searches in parallel
        const searchPromises = searchQueries.map(
          async ({ tech, category, filters }) => {
            try {
              const query = buildGitHubSearchQuery(filters);
              const response = await searchRepositories(query, 15);

              return response.repositories.map((repo) => ({
                ...repo,
                matchedTech: tech,
                matchedCategory: category,
              }));
            } catch (error) {
              console.error(`[match] error searching for ${tech}:`, error);
              return [];
            }
          },
        );

        const allResults = await Promise.all(searchPromises);
        const allRepos = allResults.flat();

        // deduplicate repositories
        const uniqueRepos = deduplicateRepositories(allRepos);

        // score and rank repositories
        const scoredRepos = scoreAndRankRepositories(
          uniqueRepos,
          input.skills,
          input.interests,
          experienceLevel,
          frameworks,
          libraries,
        );

        return {
          data: {
            repositories: scoredRepos.slice(0, 50), // top 50 matches
            totalCount: scoredRepos.length,
          },
          error: null,
          message: `found ${scoredRepos.length} repositories matching your profile`,
        };
      } catch (error) {
        console.error("[match] error finding matches:", error);
        return {
          data: null,
          error: "failed to find matches",
          message: "error finding matches",
        };
      }
    }),
});

function getTechCategory(
  tech: string,
  skills: Array<{ name: string; category: string }>,
): string {
  const skill = skills.find((s) => s.name === tech);
  return skill?.category ?? "other";
}

function getBaseFilters(
  experienceLevel: "beginner" | "intermediate" | "advanced",
  yearsOfExperience: number | null,
) {
  const baseFilters = {
    experienceLevel,
    yearsOfExperience,
    projectAge: null,
    activityLevel: "active" as const,
    minForks: null,
    maxForks: null,
    minContributors: null,
    hasHelpWanted: false,
    minOpenIssues: null,
    issueTypes: [],
    maintainerResponsiveness: "any" as const,
    hasIssueTemplates: false,
    topics: [],
    licenses: [],
    lastPushedWithin: "90days" as const,
    languages: [] as string[],
    frameworks: [] as string[],
    libraries: [] as string[],
    minStars: null as number | null,
    maxStars: null as number | null,
    maxContributors: null as number | null,
    hasGoodFirstIssues: false,
    hasMentor: false,
    hasContributingGuide: false,
    hasCodeOfConduct: false,
    isWelcoming: false,
    competitionLevel: null as "low" | "medium" | "high" | null,
  };

  // experience-specific settings
  if (experienceLevel === "beginner") {
    baseFilters.minStars = 50;
    baseFilters.maxStars = 5000;
    baseFilters.competitionLevel = "low";
    baseFilters.maxContributors = 50;
    baseFilters.hasGoodFirstIssues = true;
    baseFilters.hasMentor = true;
    baseFilters.hasContributingGuide = true;
    baseFilters.hasCodeOfConduct = true;
    baseFilters.isWelcoming = true;
  } else if (experienceLevel === "intermediate") {
    baseFilters.minStars = 500;
    baseFilters.maxStars = 20000;
    baseFilters.competitionLevel = null;
    baseFilters.maxContributors = null;
    baseFilters.hasGoodFirstIssues = true;
    baseFilters.hasMentor = false;
    baseFilters.hasContributingGuide = true;
    baseFilters.hasCodeOfConduct = true;
    baseFilters.isWelcoming = false;
  } else {
    // advanced
    baseFilters.minStars = 1000;
    baseFilters.maxStars = null;
    baseFilters.competitionLevel = null;
    baseFilters.maxContributors = null;
    baseFilters.hasGoodFirstIssues = false;
    baseFilters.hasMentor = false;
    baseFilters.hasContributingGuide = false;
    baseFilters.hasCodeOfConduct = false;
    baseFilters.isWelcoming = false;
  }

  return baseFilters;
}

function deduplicateRepositories(
  repos: Array<
    GitHubRepository & { matchedTech?: string; matchedCategory?: string }
  >,
): Array<
  GitHubRepository & { matchedTech?: string; matchedCategory?: string }
> {
  const seen = new Map<
    string,
    GitHubRepository & { matchedTech?: string; matchedCategory?: string }
  >();

  for (const repo of repos) {
    const existing = seen.get(repo.id);

    // if we haven't seen this repo, or if this match is better, keep it
    if (!existing) {
      seen.set(repo.id, repo);
    } else {
      // keep the one with more specific match (prefer primary language matches)
      if (
        repo.matchedCategory === "programming_language" &&
        existing.matchedCategory !== "programming_language"
      ) {
        seen.set(repo.id, repo);
      }
    }
  }

  return Array.from(seen.values());
}

function scoreAndRankRepositories(
  repos: Array<
    GitHubRepository & { matchedTech?: string; matchedCategory?: string }
  >,
  userSkills: Array<{ name: string; category: string }>,
  userInterests: string[],
  experienceLevel: "beginner" | "intermediate" | "advanced",
  userFrameworks: string[],
  userLibraries: string[],
): ScoredRepository[] {
  const userLanguages = userSkills
    .filter((s) => s.category === "programming_language")
    .map((s) => s.name.toLowerCase());

  const userFrameworksLower = userFrameworks.map((f) => f.toLowerCase());
  const userLibrariesLower = userLibraries.map((l) => l.toLowerCase());

  const userTechnologies = userSkills.map((s) => s.name.toLowerCase());
  const normalizedInterests = userInterests.map((i) => i.toLowerCase());

  return repos
    .map((repo) => {
      let score = 0;
      const matchReasons: string[] = [];

      // primary language match (highest weight - 50 points)
      if (
        repo.primaryLanguage &&
        userLanguages.includes(repo.primaryLanguage.name.toLowerCase())
      ) {
        score += 50;
        matchReasons.push(`uses ${repo.primaryLanguage.name}`);
      }

      // additional languages match (20 points each)
      repo.languages?.forEach((lang) => {
        const langName = lang.name.toLowerCase();
        if (
          userLanguages.includes(langName) &&
          repo.primaryLanguage?.name.toLowerCase() !== langName
        ) {
          score += 20;
          matchReasons.push(`also uses ${lang.name}`);
        }
      });

      // repository topics matching frameworks (30 points each)
      let frameworkMatches = 0;
      repo.repositoryTopics?.forEach((topicName) => {
        const normalizedTopic = topicName.toLowerCase();

        if (userFrameworksLower.includes(normalizedTopic)) {
          score += 30;
          frameworkMatches++;
          if (frameworkMatches <= 2) {
            matchReasons.push(`framework: ${topicName}`);
          }
        }
      });

      // repository topics matching libraries (25 points each)
      let libraryMatches = 0;
      repo.repositoryTopics?.forEach((topicName) => {
        const normalizedTopic = topicName.toLowerCase();

        if (userLibrariesLower.includes(normalizedTopic)) {
          score += 25;
          libraryMatches++;
          if (libraryMatches <= 2) {
            matchReasons.push(`library: ${topicName}`);
          }
        }
      });

      // repository topics matching interests (15 points each)
      let interestMatches = 0;
      repo.repositoryTopics?.forEach((topicName) => {
        const normalizedTopic = topicName.toLowerCase();

        if (normalizedInterests.includes(normalizedTopic)) {
          score += 15;
          interestMatches++;
          if (interestMatches <= 2) {
            matchReasons.push(`interest: ${topicName}`);
          }
        }
      });

      // partial topic matches (10 points)
      repo.repositoryTopics?.forEach((topicName) => {
        const normalizedTopic = topicName.toLowerCase();

        userTechnologies.forEach((tech) => {
          if (
            normalizedTopic.includes(tech) ||
            tech.includes(normalizedTopic)
          ) {
            if (
              !userFrameworksLower.includes(normalizedTopic) &&
              !userLibrariesLower.includes(normalizedTopic)
            ) {
              score += 10;
            }
          }
        });
      });

      // experience level bonuses
      if (experienceLevel === "beginner") {
        if (repo.hasGoodFirstIssues) {
          score += 40;
          matchReasons.push("has good first issues");
        }
        if (repo.hasContributingFile) {
          score += 20;
          matchReasons.push("has contributing guide");
        }
        if (repo.hasCodeOfConduct) {
          score += 15;
          matchReasons.push("has code of conduct");
        }
      } else if (experienceLevel === "intermediate") {
        if (repo.hasGoodFirstIssues) {
          score += 20;
        }
      }

      // activity score (30 points max)
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(repo.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSinceUpdate < 7) {
        score += 30;
        matchReasons.push("updated this week");
      } else if (daysSinceUpdate < 30) {
        score += 20;
        matchReasons.push("recently updated");
      } else if (daysSinceUpdate < 90) {
        score += 10;
      }

      // star count (normalized, max 25 points)
      if (repo.stargazerCount > 100 && repo.stargazerCount < 1000) {
        score += 10;
      } else if (repo.stargazerCount >= 1000 && repo.stargazerCount < 5000) {
        score += 20;
        matchReasons.push("popular project");
      } else if (repo.stargazerCount >= 5000) {
        score += 25;
        matchReasons.push("very popular project");
      }

      // open issues count (engagement indicator)
      if (
        repo.openIssuesCount &&
        repo.openIssuesCount > 5 &&
        repo.openIssuesCount < 100
      ) {
        score += 10;
        matchReasons.push("active issue tracker");
      }

      // direct tech match bonus (from search)
      if (repo.matchedTech) {
        score += 15;
      }

      // calculate missing filters
      const missingFrameworks = userFrameworks.filter(
        (fw) =>
          !repo.repositoryTopics?.some(
            (topic) => topic.toLowerCase() === fw.toLowerCase(),
          ),
      );

      const missingLibraries = userLibraries.filter(
        (lib) =>
          !repo.repositoryTopics?.some(
            (topic) => topic.toLowerCase() === lib.toLowerCase(),
          ),
      );

      return {
        ...repo,
        matchScore: score,
        matchReasons: matchReasons.slice(0, 5), // top 5 reasons
        missingFilters: {
          frameworks: missingFrameworks,
          libraries: missingLibraries,
          contributingGuide: !repo.hasContributingFile,
          codeOfConduct: !repo.hasCodeOfConduct,
          issueTemplates: !repo.hasIssueTemplate,
        },
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
