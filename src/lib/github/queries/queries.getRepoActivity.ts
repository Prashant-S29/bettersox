import { githubClient } from "../client";
import type { RepoActivityData } from "~/types/github";

const GET_REPO_ACTIVITY_QUERY = `
  query GetRepoActivity($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      nameWithOwner
      url
      description
      
      stargazerCount
      forkCount
      
      repositoryTopics(first: 10) {
        nodes {
          topic {
            name
          }
        }
      }
      
      defaultBranchRef {
        name
        target {
          ... on Commit {
            oid
            committedDate
            message
            author {
              name
              user {
                login
              }
            }
          }
        }
      }
      
      refs(refPrefix: "refs/heads/", first: 100) {
        nodes {
          name
          target {
            ... on Commit {
              oid
              committedDate
            }
          }
        }
      }
      
      pullRequests(
        first: 20
        orderBy: {field: UPDATED_AT, direction: DESC}
        states: [OPEN, MERGED, CLOSED]
      ) {
        nodes {
          number
          title
          url
          state
          createdAt
          updatedAt
          closedAt
          mergedAt
          merged
          baseRefName
          headRefName
          author {
            login
          }
          mergedBy {
            login
          }
        }
      }
        
      issues(
        first: 20
        orderBy: {field: UPDATED_AT, direction: DESC}
        states: [OPEN, CLOSED]
      ) {
        nodes {
          number
          title
          url
          state
          createdAt
          updatedAt
          closedAt
          author {
            login
          }
          labels(first: 10) {
            nodes {
              name
            }
          }
        }
      }
      
      releases(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes {
          tagName
          name
          publishedAt
          isPrerelease
          url
          description
          author {
            login
          }
        }
      }
      
      forks(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes {
          nameWithOwner
          createdAt
          owner {
            login
          }
        }
      }
      
      mentionableUsers(first: 100) {
        nodes {
          login
        }
      }
    }
    rateLimit {
      remaining
      resetAt
      cost
    }
  }
`;

export async function getRepoActivity(
  owner: string,
  name: string,
): Promise<RepoActivityData> {
  return githubClient.query<RepoActivityData>(GET_REPO_ACTIVITY_QUERY, {
    owner,
    name,
  });
}
