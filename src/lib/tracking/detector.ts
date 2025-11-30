import type { RepoActivityData } from "~/types/github";
import { TRACKABLE_EVENTS } from "~/types/types.tracker";
import { TRACKER_CONFIG } from "~/constants";

export interface DetectedEvent {
  type: string;
  title: string;
  url: string;
  author: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export class EventDetector {
  private cachedData: RepoActivityData | null = null;
  private trackedEvents: Set<string>;

  constructor(trackedEvents: string[], cachedData?: RepoActivityData) {
    this.trackedEvents = new Set(trackedEvents);
    this.cachedData = cachedData ?? null;
  }

  detect(newData: RepoActivityData): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    const lookbackMinutes = TRACKER_CONFIG.ACTIVITY_CHECK_LOOKBACK;

    // Note: We removed the early return when cachedData is null
    // Individual detection methods handle the null case

    // detect new prs
    if (this.trackedEvents.has(TRACKABLE_EVENTS.NEW_PR)) {
      const newPRs = this.detectNewPRs(newData, lookbackMinutes);
      events.push(...newPRs);
    }

    // detect new issues (all)
    if (this.trackedEvents.has(TRACKABLE_EVENTS.NEW_ISSUE)) {
      const newIssues = this.detectNewIssues(newData, lookbackMinutes);
      events.push(...newIssues);
    }

    // detect new issues with specific tag
    for (const trackedEvent of this.trackedEvents) {
      if (trackedEvent.startsWith("new_issue_with_tag:")) {
        const tag = trackedEvent.split(":")[1];
        if (tag) {
          const taggedIssues = this.detectNewIssuesWithTag(
            newData,
            tag,
            lookbackMinutes,
          );
          events.push(...taggedIssues);
        }
      }

      if (trackedEvent.startsWith("new_issue_with_custom_tag:")) {
        const tag = trackedEvent.split(":")[1];
        if (tag) {
          const taggedIssues = this.detectNewIssuesWithTag(
            newData,
            tag,
            lookbackMinutes,
          );
          events.push(...taggedIssues);
        }
      }

      if (trackedEvent.startsWith("pr_merged_to_branch:")) {
        const branch = trackedEvent.split(":")[1];
        if (branch) {
          const mergedPRs = this.detectMergedPRs(
            newData,
            branch,
            lookbackMinutes,
          );
          events.push(...mergedPRs);
        }
      }
    }

    // detect pr merged to default
    if (this.trackedEvents.has("pr_merged_to_default")) {
      const mergedPRs = this.detectPRsMergedToDefault(newData, lookbackMinutes);
      events.push(...mergedPRs);
    }

    // detect new branches
    if (this.trackedEvents.has(TRACKABLE_EVENTS.NEW_BRANCH)) {
      const newBranches = this.detectNewBranches(newData);
      events.push(...newBranches);
    }

    // detect new releases
    if (this.trackedEvents.has(TRACKABLE_EVENTS.NEW_RELEASE)) {
      const newReleases = this.detectNewReleases(newData, false);
      events.push(...newReleases);
    }

    // detect new pre-releases
    if (this.trackedEvents.has(TRACKABLE_EVENTS.NEW_PRE_RELEASE)) {
      const newPreReleases = this.detectNewReleases(newData, true);
      events.push(...newPreReleases);
    }

    // detect new forks
    if (this.trackedEvents.has("new_fork")) {
      const newForks = this.detectNewForks(newData, lookbackMinutes);
      events.push(...newForks);
    }

    // detect new contributors
    if (this.trackedEvents.has("new_contributor")) {
      const newContributors = this.detectNewContributors(newData);
      events.push(...newContributors);
    }

    // detect stars milestone
    if (this.trackedEvents.has(TRACKABLE_EVENTS.STARS_MILESTONE)) {
      const starsMilestone = this.detectStarsMilestone(newData);
      if (starsMilestone) events.push(starsMilestone);
    }

    return events;
  }

  private isWithinLookback(
    dateString: string,
    lookbackMinutes: number,
  ): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    return diffMinutes <= lookbackMinutes;
  }

  private detectMergedPRs(
    data: RepoActivityData,
    targetBranch: string | null,
    lookbackMinutes: number,
  ): DetectedEvent[] {
    const mergedPRs = data.repository.pullRequests.nodes.filter((pr) => {
      if (!pr.merged || !pr.mergedAt) return false;
      if (targetBranch && pr.baseRefName !== targetBranch) return false;
      return this.isWithinLookback(pr.mergedAt, lookbackMinutes);
    });

    return mergedPRs.map((pr) => ({
      type: targetBranch
        ? TRACKABLE_EVENTS.MERGE_TO_MAIN
        : TRACKABLE_EVENTS.PR_MERGED,
      title: `PR #${pr.number} merged${targetBranch ? ` to ${targetBranch}` : ""}: ${pr.title}`,
      url: pr.url,
      author: pr.mergedBy?.login ?? pr.author.login,
      timestamp: pr.mergedAt!,
      metadata: {
        prNumber: pr.number,
        branch: pr.baseRefName,
        headBranch: pr.headRefName,
      },
    }));
  }

  private detectNewBranches(data: RepoActivityData): DetectedEvent[] {
    if (!this.cachedData) return [];

    const oldBranches = new Set(
      this.cachedData.repository.refs.nodes.map((r) => r.name),
    );
    const newBranches = data.repository.refs.nodes.filter(
      (ref) => !oldBranches.has(ref.name),
    );

    return newBranches.map((branch) => ({
      type: TRACKABLE_EVENTS.NEW_BRANCH,
      title: `new branch created: ${branch.name}`,
      url: `${data.repository.url}/tree/${branch.name}`,
      author: "unknown",
      timestamp: branch.target.committedDate,
      metadata: {
        branchName: branch.name,
        latestCommit: branch.target.oid,
      },
    }));
  }

  private detectNewIssues(
    data: RepoActivityData,
    lookbackMinutes: number,
  ): DetectedEvent[] {
    // If no cached data, use timestamp-only check
    if (!this.cachedData) {
      const newIssues = data.repository.issues.nodes.filter((issue) =>
        this.isWithinLookback(issue.createdAt, lookbackMinutes),
      );

      return newIssues.map((issue) => ({
        type: TRACKABLE_EVENTS.NEW_ISSUE,
        title: `new issue #${issue.number}: ${issue.title}`,
        url: issue.url,
        author: issue.author.login,
        timestamp: issue.createdAt,
        metadata: {
          issueNumber: issue.number,
          state: issue.state,
        },
      }));
    }

    // Compare with cached data to find truly new issues
    const oldIssueNumbers = new Set(
      this.cachedData.repository.issues.nodes.map((i) => i.number),
    );

    const newIssues = data.repository.issues.nodes.filter(
      (issue) =>
        !oldIssueNumbers.has(issue.number) &&
        this.isWithinLookback(issue.createdAt, lookbackMinutes),
    );

    return newIssues.map((issue) => ({
      type: TRACKABLE_EVENTS.NEW_ISSUE,
      title: `new issue #${issue.number}: ${issue.title}`,
      url: issue.url,
      author: issue.author.login,
      timestamp: issue.createdAt,
      metadata: {
        issueNumber: issue.number,
        state: issue.state,
      },
    }));
  }

  private detectNewPRs(
    data: RepoActivityData,
    lookbackMinutes: number,
  ): DetectedEvent[] {
    // If no cached data, use timestamp-only check
    if (!this.cachedData) {
      const newPRs = data.repository.pullRequests.nodes.filter((pr) =>
        this.isWithinLookback(pr.createdAt, lookbackMinutes),
      );

      return newPRs.map((pr) => ({
        type: TRACKABLE_EVENTS.NEW_PR,
        title: `new PR #${pr.number}: ${pr.title}`,
        url: pr.url,
        author: pr.author.login,
        timestamp: pr.createdAt,
        metadata: {
          prNumber: pr.number,
          baseRef: pr.baseRefName,
          headRef: pr.headRefName,
        },
      }));
    }

    // Compare with cached data to find truly new PRs
    const oldPRNumbers = new Set(
      this.cachedData.repository.pullRequests.nodes.map((pr) => pr.number),
    );

    const newPRs = data.repository.pullRequests.nodes.filter(
      (pr) =>
        !oldPRNumbers.has(pr.number) &&
        this.isWithinLookback(pr.createdAt, lookbackMinutes),
    );

    return newPRs.map((pr) => ({
      type: TRACKABLE_EVENTS.NEW_PR,
      title: `new PR #${pr.number}: ${pr.title}`,
      url: pr.url,
      author: pr.author.login,
      timestamp: pr.createdAt,
      metadata: {
        prNumber: pr.number,
        baseRef: pr.baseRefName,
        headRef: pr.headRefName,
      },
    }));
  }

  private detectNewReleases(
    data: RepoActivityData,
    preleaseOnly: boolean,
  ): DetectedEvent[] {
    if (!this.cachedData) return [];

    const oldReleaseTags = new Set(
      this.cachedData.repository.releases.nodes.map((r) => r.tagName),
    );
    const newReleases = data.repository.releases.nodes.filter((release) => {
      if (!oldReleaseTags.has(release.tagName)) {
        return preleaseOnly ? release.isPrerelease : !release.isPrerelease;
      }
      return false;
    });

    return newReleases.map((release) => ({
      type: preleaseOnly
        ? TRACKABLE_EVENTS.NEW_PRE_RELEASE
        : TRACKABLE_EVENTS.NEW_RELEASE,
      title: `new ${preleaseOnly ? "pre-release" : "release"}: ${release.name}`,
      url: release.url,
      author: release.author.login,
      timestamp: release.publishedAt,
      metadata: {
        tagName: release.tagName,
        isPrerelease: release.isPrerelease,
        description: release.description,
      },
    }));
  }

  private detectNewForks(
    data: RepoActivityData,
    lookbackMinutes: number,
  ): DetectedEvent[] {
    // If no cached data, use timestamp-only check
    if (!this.cachedData) {
      const newForks = data.repository.forks.nodes.filter((fork) =>
        this.isWithinLookback(fork.createdAt, lookbackMinutes),
      );

      return newForks.map((fork) => ({
        type: TRACKABLE_EVENTS.NEW_FORK,
        title: `repository forked by ${fork.owner.login}`,
        url: `https://github.com/${fork.nameWithOwner}`,
        author: fork.owner.login,
        timestamp: fork.createdAt,
        metadata: {
          forkName: fork.nameWithOwner,
        },
      }));
    }

    // Compare with cached data to find truly new forks
    const oldForkNames = new Set(
      this.cachedData.repository.forks.nodes.map((f) => f.nameWithOwner),
    );

    const newForks = data.repository.forks.nodes.filter(
      (fork) =>
        !oldForkNames.has(fork.nameWithOwner) &&
        this.isWithinLookback(fork.createdAt, lookbackMinutes),
    );

    return newForks.map((fork) => ({
      type: TRACKABLE_EVENTS.NEW_FORK,
      title: `repository forked by ${fork.owner.login}`,
      url: `https://github.com/${fork.nameWithOwner}`,
      author: fork.owner.login,
      timestamp: fork.createdAt,
      metadata: {
        forkName: fork.nameWithOwner,
      },
    }));
  }

  private detectStarsMilestone(data: RepoActivityData): DetectedEvent | null {
    if (!this.cachedData) return null;

    const oldStars = this.cachedData.repository.stargazerCount;
    const newStars = data.repository.stargazerCount;

    const milestones = [100, 500, 1000, 5000, 10000];
    for (const milestone of milestones) {
      if (oldStars < milestone && newStars >= milestone) {
        return {
          type: TRACKABLE_EVENTS.STARS_MILESTONE,
          title: `🎉 ${data.repository.nameWithOwner} reached ${milestone} stars!`,
          url: data.repository.url,
          author: "community",
          timestamp: new Date().toISOString(),
          metadata: {
            milestone,
            currentStars: newStars,
          },
        };
      }
    }

    return null;
  }

  private detectNewIssuesWithTag(
    data: RepoActivityData,
    tag: string,
    lookbackMinutes: number,
  ): DetectedEvent[] {
    // If no cached data, use timestamp-only check
    if (!this.cachedData) {
      const newIssues = data.repository.issues.nodes.filter((issue) => {
        const hasTag = issue.labels.nodes.some((label) => label.name === tag);
        return (
          hasTag && this.isWithinLookback(issue.createdAt, lookbackMinutes)
        );
      });

      return newIssues.map((issue) => ({
        type: `new_issue_with_tag:${tag}`,
        title: `new issue #${issue.number}: ${issue.title}`,
        url: issue.url,
        author: issue.author.login,
        timestamp: issue.createdAt,
        metadata: {
          issueNumber: issue.number,
          state: issue.state,
          tag: tag,
        },
      }));
    }

    // Compare with cached data to find truly new issues
    const oldIssueNumbers = new Set(
      this.cachedData.repository.issues.nodes.map((i) => i.number),
    );

    const newIssues = data.repository.issues.nodes.filter((issue) => {
      const hasTag = issue.labels.nodes.some((label) => label.name === tag);
      return (
        !oldIssueNumbers.has(issue.number) &&
        hasTag &&
        this.isWithinLookback(issue.createdAt, lookbackMinutes)
      );
    });

    return newIssues.map((issue) => ({
      type: `new_issue_with_tag:${tag}`,
      title: `new issue #${issue.number}: ${issue.title}`,
      url: issue.url,
      author: issue.author.login,
      timestamp: issue.createdAt,
      metadata: {
        issueNumber: issue.number,
        state: issue.state,
        tag: tag,
      },
    }));
  }

  private detectPRsMergedToDefault(
    data: RepoActivityData,
    lookbackMinutes: number,
  ): DetectedEvent[] {
    const defaultBranch = data.repository.defaultBranchRef.name;
    const mergedPRs = data.repository.pullRequests.nodes.filter((pr) => {
      if (!pr.merged || !pr.mergedAt) return false;
      if (pr.baseRefName !== defaultBranch) return false;
      return this.isWithinLookback(pr.mergedAt, lookbackMinutes);
    });

    return mergedPRs.map((pr) => ({
      type: "pr_merged_to_default",
      title: `PR #${pr.number} merged to ${defaultBranch}: ${pr.title}`,
      url: pr.url,
      author: pr.mergedBy?.login ?? pr.author.login,
      timestamp: pr.mergedAt!,
      metadata: {
        prNumber: pr.number,
        branch: pr.baseRefName,
        headBranch: pr.headRefName,
      },
    }));
  }

  private detectNewContributors(data: RepoActivityData): DetectedEvent[] {
    if (!this.cachedData) return [];

    const oldContributors = new Set(
      this.cachedData.repository.mentionableUsers.nodes.map((u) => u.login),
    );

    const newContributors = data.repository.mentionableUsers.nodes.filter(
      (user) => !oldContributors.has(user.login),
    );

    return newContributors.map((user) => ({
      type: "new_contributor",
      title: `New contributor: ${user.login}`,
      url: `https://github.com/${user.login}`,
      author: user.login,
      timestamp: new Date().toISOString(),
      metadata: {
        contributorLogin: user.login,
      },
    }));
  }
}
