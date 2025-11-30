import { createHash } from "crypto";
import type { RepoActivityData } from "~/types/github";

interface SignatureData {
  // commit tracking
  lastCommit: string;
  lastCommitDate: string;

  // issue tracking
  issueNumbers: number[];
  issueStates: Record<number, string>; // number -> state
  issueClosedDates: Record<number, string | null>;

  // pr tracking
  prNumbers: number[];
  prStates: Record<number, string>;
  prMergedDates: Record<number, string | null>;
  prMergedBy: Record<number, string | null>;

  // release tracking
  releaseTagNames: string[];
  releasePublishedDates: Record<string, string>;

  // branch tracking
  branches: string[];
  branchCommits: Record<string, string>; // branch -> latest commit

  // social metrics
  starCount: number;
  forkCount: number;

  // repository metadata
  description: string;
  topics: string[];

  // contributor tracking
  contributors: string[];

  // recent fork tracking
  recentForks: Array<{
    name: string;
    createdAt: string;
  }>;
}

/**
 * Generates a stable signature from repository activity data
 * Any change in the repo will result in a different signature
 */
export function generateActivitySignature(data: RepoActivityData): string {
  // Build comprehensive signature data
  const signatureData: SignatureData = {
    // Latest commit on default branch
    lastCommit: data.repository.defaultBranchRef.target.oid,
    lastCommitDate: data.repository.defaultBranchRef.target.committedDate,

    // All issue numbers and their states
    issueNumbers: data.repository.issues.nodes.map((i) => i.number).sort(),
    issueStates: Object.fromEntries(
      data.repository.issues.nodes.map((i) => [i.number, i.state]),
    ),
    issueClosedDates: Object.fromEntries(
      data.repository.issues.nodes.map((i) => [i.number, i.closedAt]),
    ),

    // All PR numbers and their states
    prNumbers: data.repository.pullRequests.nodes.map((pr) => pr.number).sort(),
    prStates: Object.fromEntries(
      data.repository.pullRequests.nodes.map((pr) => [pr.number, pr.state]),
    ),
    prMergedDates: Object.fromEntries(
      data.repository.pullRequests.nodes.map((pr) => [pr.number, pr.mergedAt]),
    ),
    prMergedBy: Object.fromEntries(
      data.repository.pullRequests.nodes.map((pr) => [
        pr.number,
        pr.mergedBy?.login ?? null,
      ]),
    ),

    // All releases
    releaseTagNames: data.repository.releases.nodes
      .map((r) => r.tagName)
      .sort(),
    releasePublishedDates: Object.fromEntries(
      data.repository.releases.nodes.map((r) => [r.tagName, r.publishedAt]),
    ),

    // All branches and their latest commits
    branches: data.repository.refs.nodes.map((ref) => ref.name).sort(),
    branchCommits: Object.fromEntries(
      data.repository.refs.nodes.map((ref) => [ref.name, ref.target.oid]),
    ),

    // Social metrics
    starCount: data.repository.stargazerCount,
    forkCount: data.repository.forkCount,

    // Repository metadata
    description: data.repository.description || "",
    topics: data.repository.repositoryTopics.nodes
      .map((t) => t.topic.name)
      .sort(),

    // Contributors
    contributors: data.repository.mentionableUsers.nodes
      .map((u) => u.login)
      .sort(),

    // Recent forks (sorted by creation date)
    recentForks: data.repository.forks.nodes
      .map((f) => ({
        name: f.nameWithOwner,
        createdAt: f.createdAt,
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };

  // Convert to stable JSON string (sorted keys)
  const jsonString = JSON.stringify(
    signatureData,
    Object.keys(signatureData).sort(),
  );

  // Generate SHA-256 hash
  return createHash("sha256").update(jsonString).digest("hex");
}

/**
 * Compare two signatures
 */
export function signaturesMatch(sig1: string, sig2: string): boolean {
  return sig1 === sig2;
}

/**
 * Validate signature format
 */
export function isValidSignature(signature: string): boolean {
  return /^[a-f0-9]{64}$/i.test(signature);
}
