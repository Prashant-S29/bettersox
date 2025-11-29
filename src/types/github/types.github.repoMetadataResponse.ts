export interface GraphQLRepoMetadataResponse {
  repository: {
    owner: { login: string };
    name: string;
    nameWithOwner: string;
    isPrivate: boolean;
    isArchived: boolean;
    defaultBranchRef: { name: string } | null;
    refs: {
      nodes: Array<{ name: string }>;
    };
  };
}

