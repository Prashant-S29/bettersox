// src/types/types.nlp.ts
import type { SearchFiltersSchemaType } from "~/schema";

export type SearchFilters = SearchFiltersSchemaType;

// extracted matches from query (for real-time highlighting)
export interface ExtractedMatch {
  text: string;
  category: FilterCategory;
  start: number;
  end: number;
  value: string | string[];
}

// internal categories (used by patterns)
export type FilterCategory =
  | "language"
  | "framework"
  | "library"
  | "experience"
  | "stars"
  | "contributors"
  | "activity"
  | "issue";

// ui categories (shown as badges)
export type UICategory =
  | "languages"
  | "contributors"
  | "stars"
  | "experience"
  | "activity"
  | "issue";

// parsed query result (for real-time parsing)
export interface ParsedQuery {
  originalQuery: string;
  filters: Partial<SearchFilters>;
  matches: ExtractedMatch[];
  confidence: number;
}

// pattern definition for extraction
export interface Pattern {
  regex: RegExp;
  category: FilterCategory;
  normalizer?: (match: string) => string;
  valueExtractor?: (match: string) => string | string[];
}