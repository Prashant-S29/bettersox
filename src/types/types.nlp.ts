// Filter Categories
export interface SearchFilters {
  // Tech Stack
  languages: string[];
  frameworks: string[];
  libraries: string[];

  // Experience & Complexity
  experienceLevel?: "beginner" | "intermediate" | "advanced" | null;
  yearsOfExperience?: number | null;

  // Project Characteristics
  projectAge?: "very_new" | "new" | "established" | "mature" | null;
  competitionLevel?: "low" | "medium" | "high" | null;
  activityLevel?: "very_active" | "active" | "moderate" | "inactive" | null;

  // Repository Metrics
  minStars?: number | null;
  maxStars?: number | null;
  minForks?: number | null;
  maxForks?: number | null;
  minContributors?: number | null;
  maxContributors?: number | null;

  // Issue Filters
  hasGoodFirstIssues: boolean;
  hasHelpWanted: boolean;
  minOpenIssues?: number | null;
  issueTypes: string[];

  // Maintainer Quality
  maintainerResponsiveness: "high" | "medium" | "low" | "any";
  hasMentor: boolean;

  // Community Features
  hasContributingGuide: boolean;
  hasCodeOfConduct: boolean;
  hasIssueTemplates: boolean;
  isWelcoming: boolean;

  // Topics/Tags
  topics: string[];

  // License
  licenses: string[];

  // Time-based
  lastPushedWithin?:
    | "7days"
    | "30days"
    | "90days"
    | "180days"
    | "365days"
    | null;
}

// Extracted matches from query (for real-time highlighting)
export interface ExtractedMatch {
  text: string;
  category: FilterCategory;
  start: number;
  end: number;
  value: string | string[];
}

// Internal categories (used by patterns)
export type FilterCategory =
  | "language"
  | "framework"
  | "library"
  | "experience"
  | "stars"
  | "contributors"
  | "activity"
  | "issue";

// UI categories (shown as badges)
export type UICategory =
  | "languages"
  | "contributors"
  | "stars"
  | "experience"
  | "activity"
  | "issue";

// Parsed query result (for real-time parsing)
export interface ParsedQuery {
  originalQuery: string;
  filters: Partial<SearchFilters>;
  matches: ExtractedMatch[];
  confidence: number;
}

// Pattern definition for extraction
export interface Pattern {
  regex: RegExp;
  category: FilterCategory;
  normalizer?: (match: string) => string;
  valueExtractor?: (match: string) => string | string[];
}
