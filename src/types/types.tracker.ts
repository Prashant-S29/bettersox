export const TRACKABLE_EVENTS = {
  // Branch & Merge events
  MERGE_TO_MAIN: "merge_to_main",
  MERGE_TO_BRANCH: "merge_to_branch",
  NEW_BRANCH: "new_branch",

  // Issue events
  NEW_ISSUE: "new_issue",
  ISSUE_CLOSED: "issue_closed",

  // Pull Request events
  NEW_PR: "new_pr",
  PR_MERGED: "pr_merged",
  PR_CLOSED: "pr_closed",

  // Release events
  NEW_RELEASE: "new_release",
  NEW_PRE_RELEASE: "new_pre_release",

  // Collaboration events
  NEW_CONTRIBUTOR: "new_contributor",
  NEW_FORK: "new_fork",

  // Milestone events
  STARS_MILESTONE: "stars_milestone",

  // Repository changes
  DESCRIPTION_CHANGED: "description_changed",
  TOPICS_CHANGED: "topics_changed",
} as const;

export type TrackableEvent =
  (typeof TRACKABLE_EVENTS)[keyof typeof TRACKABLE_EVENTS];

export interface EventOption {
  id: TrackableEvent;
  label: string;
  description: string;
  category: "commits" | "issues" | "pulls" | "releases" | "social" | "repo";
  hasSubOptions: boolean;
  subOptions?: {
    id: string;
    label: string;
    type: "input" | "select";
    options?: string[];
  }[];
}

export const EVENT_OPTIONS: EventOption[] = [
  // Commits & Branches
  {
    id: TRACKABLE_EVENTS.MERGE_TO_MAIN,
    label: "Merge to main branch",
    description: "Get notified when a PR is merged to the main/master branch",
    category: "commits",
    hasSubOptions: false,
  },
  {
    id: TRACKABLE_EVENTS.MERGE_TO_BRANCH,
    label: "Merge to specific branch",
    description: "Track merges to a specific branch",
    category: "commits",
    hasSubOptions: true,
    subOptions: [
      {
        id: "branch_name",
        label: "Branch name",
        type: "input",
      },
    ],
  },
  {
    id: TRACKABLE_EVENTS.NEW_BRANCH,
    label: "New branch created",
    description: "Get notified when a new branch is created",
    category: "commits",
    hasSubOptions: false,
  },

  // Issues
  {
    id: TRACKABLE_EVENTS.NEW_ISSUE,
    label: "New issue opened",
    description: "Track when new issues are created",
    category: "issues",
    hasSubOptions: false,
  },
  {
    id: TRACKABLE_EVENTS.ISSUE_CLOSED,
    label: "Issue closed",
    description: "Get notified when issues are closed",
    category: "issues",
    hasSubOptions: false,
  },

  // Pull Requests
  {
    id: TRACKABLE_EVENTS.NEW_PR,
    label: "New pull request",
    description: "Track new pull requests",
    category: "pulls",
    hasSubOptions: true,
    subOptions: [
      {
        id: "target_branch",
        label: "Target branch (optional)",
        type: "input",
      },
    ],
  },
  {
    id: TRACKABLE_EVENTS.PR_MERGED,
    label: "Pull request merged",
    description: "Get notified when PRs are merged",
    category: "pulls",
    hasSubOptions: false,
  },
  {
    id: TRACKABLE_EVENTS.PR_CLOSED,
    label: "Pull request closed",
    description: "Track when PRs are closed without merging",
    category: "pulls",
    hasSubOptions: false,
  },

  // Releases
  {
    id: TRACKABLE_EVENTS.NEW_RELEASE,
    label: "New release published",
    description: "Get notified about new stable releases",
    category: "releases",
    hasSubOptions: false,
  },
  {
    id: TRACKABLE_EVENTS.NEW_PRE_RELEASE,
    label: "New pre-release",
    description: "Track beta/alpha releases",
    category: "releases",
    hasSubOptions: false,
  },

  // Social & Growth
  {
    id: TRACKABLE_EVENTS.NEW_CONTRIBUTOR,
    label: "New contributor",
    description: "Get notified when someone makes their first contribution",
    category: "social",
    hasSubOptions: false,
  },
  {
    id: TRACKABLE_EVENTS.NEW_FORK,
    label: "Repository forked",
    description: "Track when the repo is forked",
    category: "social",
    hasSubOptions: false,
  },
  {
    id: TRACKABLE_EVENTS.STARS_MILESTONE,
    label: "Stars milestone reached",
    description: "Get notified every 100/500/1000 stars",
    category: "social",
    hasSubOptions: true,
    subOptions: [
      {
        id: "milestone_interval",
        label: "Notify every",
        type: "select",
        options: ["100 stars", "500 stars", "1000 stars"],
      },
    ],
  },

  // Repository Changes
  {
    id: TRACKABLE_EVENTS.DESCRIPTION_CHANGED,
    label: "Description updated",
    description: "Track changes to repository description",
    category: "repo",
    hasSubOptions: false,
  },
  {
    id: TRACKABLE_EVENTS.TOPICS_CHANGED,
    label: "Topics updated",
    description: "Get notified when repository topics change",
    category: "repo",
    hasSubOptions: false,
  },
];
