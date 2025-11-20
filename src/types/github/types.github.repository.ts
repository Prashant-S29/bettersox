export interface GitHubRepository {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  openIssuesCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  languages: {
    name: string;
    color: string;
  }[];
  topics: string[];
  hasIssues: boolean;
  hasGoodFirstIssues: boolean;
  hasHelpWantedIssues: boolean;
  updatedAt: string;
  pushedAt: string;
  createdAt: string;
  licenseInfo: {
    name: string;
    spdxId: string;
  } | null;
  owner: {
    login: string;
    avatarUrl: string;
  };
  defaultBranchRef: {
    name: string;
  } | null;
  hasContributingFile: boolean;
  hasCodeOfConduct: boolean;
  hasIssueTemplate: boolean;
  repositoryTopics: string[];
}