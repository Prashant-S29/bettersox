import { createHash } from "crypto";
import type { RepoActivityData } from "~/types/github";

interface SignatureData {
  lastCommit: string;
  issueNumbers: number[];
  prNumbers: number[];
  releaseTagNames: string[];
  branches: string[];
  starCount: number;
  forkCount: number;
  description: string;
  topics: string[];
  contributors: string[];
}

export function generateActivitySignature(data: RepoActivityData): string {
  const signatureData: SignatureData = {
    lastCommit: data.repository.defaultBranchRef.target.oid,
    issueNumbers: data.repository.issues.nodes.map((i) => i.number),
    prNumbers: data.repository.pullRequests.nodes.map((pr) => pr.number),
    releaseTagNames: data.repository.releases.nodes.map((r) => r.tagName),
    branches: data.repository.refs.nodes.map((ref) => ref.name),
    starCount: data.repository.stargazerCount,
    forkCount: data.repository.forkCount,
    description: data.repository.description,
    topics: data.repository.repositoryTopics.nodes.map((t) => t.topic.name),
    contributors: data.repository.mentionableUsers.nodes.map((u) => u.login),
  };

  // sort keys for consistent hashing
  const jsonString = JSON.stringify(
    signatureData,
    Object.keys(signatureData).sort(),
  );
  return createHash("sha256").update(jsonString).digest("hex");
}
