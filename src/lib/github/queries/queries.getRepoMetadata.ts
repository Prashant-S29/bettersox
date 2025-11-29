import type { GraphQLRepoMetadataResponse } from "~/types/github";
import { githubClient } from "../client";
import type { RepoMetadata } from "~/types/types.tracker";

const GET_REPO_METADATA = `
  query GetRepoMetadata($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      owner {
        login
      }
      name
      nameWithOwner
      isPrivate
      isArchived
      defaultBranchRef {
        name
      }
      refs(refPrefix: "refs/heads/", first: 100) {
        nodes {
          name
        }
      }
    }
  }
`;

export async function getRepoMetadata(
  owner: string,
  name: string,
): Promise<RepoMetadata> {
  const data = await githubClient.query<GraphQLRepoMetadataResponse>(
    GET_REPO_METADATA,
    { owner, name },
  );

  return {
    owner: data.repository.owner.login,
    name: data.repository.name,
    fullName: data.repository.nameWithOwner,
    defaultBranch: data.repository.defaultBranchRef?.name ?? "main",
    branches: data.repository.refs.nodes.map((node) => node.name),
    isPrivate: data.repository.isPrivate,
    isArchived: data.repository.isArchived,
  };
}
