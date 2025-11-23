export interface RepoVerification {
  repository: {
    id: string;
    nameWithOwner: string;
    description: string;
    isPrivate: boolean;
    isArchived: boolean;
    isFork: boolean;
    visibility: string;
    url: string;
  };
}

export interface RepoActivityData {
  repository: {
    id: string;
    nameWithOwner: string;
    url: string;
    description: string;
    stargazerCount: number;
    forkCount: number;
    repositoryTopics: {
      nodes: Array<{ topic: { name: string } }>;
    };
    defaultBranchRef: {
      name: string;
      target: {
        oid: string;
        committedDate: string;
        message: string;
        author: {
          name: string;
          user: { login: string } | null;
        };
      };
    };
    refs: {
      nodes: Array<{
        name: string;
        target: {
          oid: string;
          committedDate: string;
        };
      }>;
    };
    pullRequests: {
      nodes: Array<{
        number: number;
        title: string;
        url: string;
        state: string;
        createdAt: string;
        updatedAt: string;
        closedAt: string | null;
        mergedAt: string | null;
        merged: boolean;
        baseRefName: string;
        headRefName: string;
        author: { login: string };
        mergedBy: { login: string } | null;
      }>;
    };
    issues: {
      nodes: Array<{
        number: number;
        title: string;
        url: string;
        state: string;
        createdAt: string;
        updatedAt: string;
        closedAt: string | null;
        author: { login: string };
        labels: {
          nodes: Array<{
            name: string;
          }>;
        };
      }>;
    };
    releases: {
      nodes: Array<{
        tagName: string;
        name: string;
        publishedAt: string;
        isPrerelease: boolean;
        url: string;
        description: string;
        author: { login: string };
      }>;
    };
    forks: {
      nodes: Array<{
        nameWithOwner: string;
        createdAt: string;
        owner: { login: string };
      }>;
    };
    mentionableUsers: {
      nodes: Array<{ login: string }>;
    };
  };
  rateLimit: {
    remaining: number;
    resetAt: string;
    cost: number;
  };
}
