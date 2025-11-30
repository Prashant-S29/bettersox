export interface GraphQLLanguageNode {
  name: string;
  color: string;
}

export interface GraphQLTopicNode {
  topic: {
    name: string;
  };
}

export interface GraphQLIssueTemplate {
  name: string;
}

export interface GraphQLRepositoryNode {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  openIssues: {
    totalCount: number;
  };
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  languages: {
    nodes: GraphQLLanguageNode[];
  };
  repositoryTopics: {
    nodes: GraphQLTopicNode[];
  };
  hasIssuesEnabled: boolean;
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
  goodFirstIssues: {
    totalCount: number;
  };
  helpWantedIssues: {
    totalCount: number;
  };
  contributingFile: {
    id: string;
  } | null;
  codeOfConduct: {
    id: string;
  } | null;
  issueTemplates: GraphQLIssueTemplate[];
}

export interface GraphQLSearchResult {
  repositoryCount: number;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  edges: {
    node: GraphQLRepositoryNode;
  }[];
}

export interface GraphQLSearchResponse {
  data: {
    search: GraphQLSearchResult;
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}
