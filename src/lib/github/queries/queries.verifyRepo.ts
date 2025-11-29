import type { RepoVerification } from "~/types/github";
import { githubClient } from "../client";

const VERIFY_REPOSITORY_QUERY = `
  query VerifyRepo($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      nameWithOwner
      description
      isPrivate
      isArchived
      isFork
      visibility
      url
    }
  }
`;

export async function verifyRepo(
  owner: string,
  name: string,
): Promise<RepoVerification> {
  return githubClient.query<RepoVerification>(VERIFY_REPOSITORY_QUERY, {
    owner,
    name,
  });
}
