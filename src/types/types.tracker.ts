// src/types/types.tracker.ts

// All trackable events combined
export const TRACKABLE_EVENTS = {
  // PR events
  NEW_PR: "new_pr",
  PR_MERGED_TO_DEFAULT: "pr_merged_to_default",
  PR_MERGED_TO_BRANCH: "pr_merged_to_branch",
  PR_MERGED: "pr_merged", // Generic PR merged (any branch)
  MERGE_TO_MAIN: "merge_to_main", // Alias for PR_MERGED_TO_DEFAULT
  
  // Issue events
  NEW_ISSUE: "new_issue",
  NEW_ISSUE_WITH_TAG: "new_issue_with_tag",
  NEW_ISSUE_WITH_CUSTOM_TAG: "new_issue_with_custom_tag",
  
  // Social/Community events
  NEW_CONTRIBUTOR: "new_contributor",
  NEW_FORK: "new_fork",
  STARS_MILESTONE: "stars_milestone",
  
  // Release events
  NEW_RELEASE: "new_release",
  NEW_PRE_RELEASE: "new_pre_release",
  
  // Branch events
  NEW_BRANCH: "new_branch",
} as const;

// PR events with specific merge targets (for UI grouping)
export const PR_EVENTS = {
  NEW_PR: TRACKABLE_EVENTS.NEW_PR,
  PR_MERGED_TO_DEFAULT: TRACKABLE_EVENTS.PR_MERGED_TO_DEFAULT,
  PR_MERGED_TO_BRANCH: TRACKABLE_EVENTS.PR_MERGED_TO_BRANCH,
} as const;

export const ISSUE_EVENTS = {
  NEW_ISSUE: TRACKABLE_EVENTS.NEW_ISSUE,
  NEW_ISSUE_WITH_TAG: TRACKABLE_EVENTS.NEW_ISSUE_WITH_TAG,
  NEW_ISSUE_WITH_CUSTOM_TAG: TRACKABLE_EVENTS.NEW_ISSUE_WITH_CUSTOM_TAG,
} as const;

// additional options (for UI grouping)
export const SOCIAL_EVENTS = {
  NEW_CONTRIBUTOR: TRACKABLE_EVENTS.NEW_CONTRIBUTOR,
  NEW_FORK: TRACKABLE_EVENTS.NEW_FORK,
  STARS_MILESTONE: TRACKABLE_EVENTS.STARS_MILESTONE,
  NEW_RELEASE: TRACKABLE_EVENTS.NEW_RELEASE,
} as const;

export type TrackableEvent = (typeof TRACKABLE_EVENTS)[keyof typeof TRACKABLE_EVENTS];
export type PrEvent = (typeof PR_EVENTS)[keyof typeof PR_EVENTS];
export type IssueEvent = (typeof ISSUE_EVENTS)[keyof typeof ISSUE_EVENTS];
export type SocialEvent = (typeof SOCIAL_EVENTS)[keyof typeof SOCIAL_EVENTS];

// common github issue labels
export const GITHUB_LABELS = [
  {
    value: "bug",
    label: "Bug",
    description: "Indicates an unexpected problem",
  },
  {
    value: "documentation",
    label: "Documentation",
    description: "Improvements or additions to documentation",
  },
  {
    value: "duplicate",
    label: "Duplicate",
    description: "Similar issues or PRs",
  },
  {
    value: "enhancement",
    label: "Enhancement",
    description: "New feature requests",
  },
  {
    value: "good first issue",
    label: "Good First Issue",
    description: "Good for first-time contributors",
  },
  {
    value: "help wanted",
    label: "Help Wanted",
    description: "Maintainer wants help",
  },
  { value: "invalid", label: "Invalid", description: "No longer relevant" },
  {
    value: "question",
    label: "Question",
    description: "Needs more information",
  },
  { value: "wontfix", label: "Won't Fix", description: "Work won't continue" },
] as const;

// repo metadata from github
export interface RepoMetadata {
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  branches: string[];
  isPrivate: boolean;
  isArchived: boolean;
}