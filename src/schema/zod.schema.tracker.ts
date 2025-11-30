import { z } from "zod";
import { normalizeGitHubUrl } from "~/lib/github";
import { ISSUE_EVENTS, PR_EVENTS } from "~/types/types.tracker";

const githubUrlRegex =
  /^https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/;

// step 1: verify repo
export const verifyRepoSchema = z.object({
  repoUrl: z
    .string()
    .min(1, "Repository URL is required")
    .transform((url) => normalizeGitHubUrl({ url }))
    .refine(
      (url) => {
        try {
          new URL(url);
          return githubUrlRegex.test(url);
        } catch {
          return false;
        }
      },
      {
        message:
          "Must be a valid GitHub repository URL, https and ssh supported.",
      },
    ),
});

export type VerifyRepoInput = z.infer<typeof verifyRepoSchema>;

// step 2: configure tracking
export const createTrackerSchema = z
  .object({
    repoUrl: z.string().url(),

    // pull requests - radio (only one)
    prEvent: z.enum([
      PR_EVENTS.NEW_PR,
      PR_EVENTS.PR_MERGED_TO_DEFAULT,
      PR_EVENTS.PR_MERGED_TO_BRANCH,
      "none",
    ] as const),

    prTargetBranch: z.string().optional(),

    // issues - radio (only one)
    issueEvent: z.enum([
      ISSUE_EVENTS.NEW_ISSUE,
      ISSUE_EVENTS.NEW_ISSUE_WITH_TAG,
      ISSUE_EVENTS.NEW_ISSUE_WITH_CUSTOM_TAG,
      "none",
    ] as const),

    issueTag: z.string().optional(),

    // additional options - checkboxes (multiple allowed)
    trackNewContributor: z.boolean(),
    trackNewFork: z.boolean(),
    trackNewRelease: z.boolean(),

    enableAiSummary: z.boolean(),
  })

  .refine(
    (data) => {
      // if pr merged to branch, branch must be provided
      if (data.prEvent === PR_EVENTS.PR_MERGED_TO_BRANCH) {
        return !!data.prTargetBranch?.trim();
      }
      return true;
    },
    {
      message: "please select a branch",
      path: ["prTargetBranch"],
    },
  )
  .refine(
    (data) => {
      // if issue with tag, tag must be provided
      if (data.issueEvent === ISSUE_EVENTS.NEW_ISSUE_WITH_TAG) {
        return !!data.issueTag?.trim();
      }
      if (data.issueEvent === ISSUE_EVENTS.NEW_ISSUE_WITH_CUSTOM_TAG) {
        return !!data.issueTag?.trim();
      }
      return true;
    },
    {
      message: "please provide a tag",
      path: ["issueTag"],
    },
  )
  .refine(
    (data) => {
      // count total events selected (min 1, max 4)
      let count = 0;

      if (data.prEvent !== "none") count++;
      if (data.issueEvent !== "none") count++;
      if (data.trackNewContributor) count++;
      if (data.trackNewFork) count++;
      if (data.trackNewRelease) count++;

      return count >= 1 && count <= 4;
    },
    {
      message: "please select between 1 and 4 events to track",
      path: ["prEvent"],
    },
  );

export type CreateTrackerInput = z.infer<typeof createTrackerSchema>;

export const updateTrackerSchema = z.object({
  prEvent: z
    .enum([
      PR_EVENTS.NEW_PR,
      PR_EVENTS.PR_MERGED_TO_DEFAULT,
      PR_EVENTS.PR_MERGED_TO_BRANCH,
      "none",
    ] as const)
    .optional(),
  prTargetBranch: z.string().optional(),
  issueEvent: z
    .enum([
      ISSUE_EVENTS.NEW_ISSUE,
      ISSUE_EVENTS.NEW_ISSUE_WITH_TAG,
      ISSUE_EVENTS.NEW_ISSUE_WITH_CUSTOM_TAG,
      "none",
    ] as const)
    .optional(),
  issueTag: z.string().optional(),
  trackNewContributor: z.boolean().optional(),
  trackNewFork: z.boolean().optional(),
  trackNewRelease: z.boolean().optional(),
  enableAiSummary: z.boolean().optional(),
  isPaused: z.boolean().optional(),
});

export type UpdateTrackerInput = z.infer<typeof updateTrackerSchema>;

export function parseGitHubUrl(
  url: string,
): { owner: string; name: string } | null {
  // Normalize the URL first
  const normalizedUrl = normalizeGitHubUrl({ url });
  const match = githubUrlRegex.exec(normalizedUrl);
  if (!match) return null;
  const [, owner, name] = match;
  return { owner: owner!, name: name! };
}
