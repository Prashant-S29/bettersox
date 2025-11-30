import type { GitHubRepository } from "./types.github.repository";

export interface GitHubSearchResponse {
  repositories: GitHubRepository[];
  totalCount: number;
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ScoredRepository extends GitHubRepository {
  matchScore: number;
  matchReasons: string[];
  matchedTech?: string;
  matchedCategory?: string;
  missingFilters: {
    frameworks: string[];
    libraries: string[];
    contributingGuide: boolean;
    codeOfConduct: boolean;
    issueTemplates: boolean;
  };
}

export interface EnrichedRepository extends GitHubRepository {
  missingFilters: {
    frameworks: string[];
    libraries: string[];
    contributingGuide: boolean;
    codeOfConduct: boolean;
    issueTemplates: boolean;
  };
}
