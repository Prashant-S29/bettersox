import { z } from "zod";

export const SearchFiltersSchema = z.object({
  languages: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  libraries: z.array(z.string()).default([]),
  experienceLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .nullable()
    .default(null),
  yearsOfExperience: z.number().nullable().default(null),
  projectAge: z
    .enum(["very_new", "new", "established", "mature"])
    .nullable()
    .default(null),
  competitionLevel: z
    .enum(["low", "medium", "high"])
    .nullable()
    .default(null),
  activityLevel: z
    .enum(["very_active", "active", "moderate", "inactive"])
    .nullable()
    .default(null),
  minStars: z.number().nullable().default(null),
  maxStars: z.number().nullable().default(null),
  minForks: z.number().nullable().default(null),
  maxForks: z.number().nullable().default(null),
  minContributors: z.number().nullable().default(null),
  maxContributors: z.number().nullable().default(null),
  hasGoodFirstIssues: z.boolean().default(false),
  hasHelpWanted: z.boolean().default(false),
  minOpenIssues: z.number().nullable().default(null),
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
    .default(null),
});

export type SearchFiltersSchemaType = z.infer<typeof SearchFiltersSchema>;