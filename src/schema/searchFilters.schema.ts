import z from "zod";

export const SearchFiltersSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  libraries: z.array(z.string()),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).nullable(),
  yearsOfExperience: z.number().nullable(),
  projectAge: z.enum(["very_new", "new", "established", "mature"]).nullable(),
  competitionLevel: z.enum(["low", "medium", "high"]).nullable(),
  activityLevel: z
    .enum(["very_active", "active", "moderate", "inactive"])
    .nullable(),
  minStars: z.number().nullable(),
  maxStars: z.number().nullable(),
  minForks: z.number().nullable(),
  maxForks: z.number().nullable(),
  minContributors: z.number().nullable(),
  maxContributors: z.number().nullable(),
  hasGoodFirstIssues: z.boolean(),
  hasHelpWanted: z.boolean(),
  minOpenIssues: z.number().nullable(),
  issueTypes: z.array(z.string()),
  maintainerResponsiveness: z.enum(["high", "medium", "low", "any"]),
  hasMentor: z.boolean(),
  hasContributingGuide: z.boolean(),
  hasCodeOfConduct: z.boolean(),
  hasIssueTemplates: z.boolean(),
  isWelcoming: z.boolean(),
  topics: z.array(z.string()),
  licenses: z.array(z.string()),
  lastPushedWithin: z
    .enum(["7days", "30days", "90days", "180days", "365days"])
    .nullable(),
});

export type SearchFiltersSchemaType = z.infer<typeof SearchFiltersSchema>;
