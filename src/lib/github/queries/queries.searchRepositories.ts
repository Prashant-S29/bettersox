import type { GraphQLSearchResult, GitHubSearchResponse } from "~/types/github";
import { githubClient } from "../client";

const SEARCH_REPOSITORIES_QUERY = `
  query SearchRepositories($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: REPOSITORY, first: $first, after: $after) {
      repositoryCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ... on Repository {
            id
            name
            nameWithOwner
            description
            url
            stargazerCount
            forkCount
            openIssues: issues(states: OPEN) {
              totalCount
            }
            primaryLanguage {
              name
              color
            }
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              nodes {
                name
                color
              }
            }
            repositoryTopics(first: 10) {
              nodes {
                topic {
                  name
                }
              }
            }
            hasIssuesEnabled
            updatedAt
            pushedAt
            createdAt
            licenseInfo {
              name
              spdxId
            }
            owner {
              login
              avatarUrl
            }
            defaultBranchRef {
              name
            }
            goodFirstIssues: issues(labels: ["good first issue"], states: OPEN, first: 1) {
              totalCount
            }
            helpWantedIssues: issues(labels: ["help wanted"], states: OPEN, first: 1) {
              totalCount
            }
            contributingFile: object(expression: "HEAD:CONTRIBUTING.md") {
              ... on Blob {
                id
              }
            }
            codeOfConduct {
              id
            }
            issueTemplates {
              name
            }
          }
        }
      }
    }
  }
`;

export async function searchRepositories(
  query: string,
  first = 20,
  after?: string,
): Promise<GitHubSearchResponse> {
  const data = await githubClient.query<{ search: GraphQLSearchResult }>(
    SEARCH_REPOSITORIES_QUERY,
    {
      query,
      first,
      after: after ?? null,
    },
  );

  const searchResult = data.search;

  const repositories = searchResult.edges.map((edge) => {
    const node = edge.node;
    return {
      id: node.id,
      name: node.name,
      nameWithOwner: node.nameWithOwner,
      description: node.description,
      url: node.url,
      stargazerCount: node.stargazerCount,
      forkCount: node.forkCount,
      openIssuesCount: node.openIssues.totalCount,
      primaryLanguage: node.primaryLanguage,
      languages: node.languages.nodes,
      topics: node.repositoryTopics.nodes.map((t) => t.topic.name),
      hasIssues: node.hasIssuesEnabled,
      hasGoodFirstIssues: node.goodFirstIssues.totalCount > 0,
      hasHelpWantedIssues: node.helpWantedIssues.totalCount > 0,
      updatedAt: node.updatedAt,
      pushedAt: node.pushedAt,
      createdAt: node.createdAt,
      licenseInfo: node.licenseInfo,
      owner: node.owner,
      defaultBranchRef: node.defaultBranchRef,
      hasContributingFile: !!node.contributingFile,
      hasCodeOfConduct: !!node.codeOfConduct,
      hasIssueTemplate: node.issueTemplates && node.issueTemplates.length > 0,
      repositoryTopics: node.repositoryTopics.nodes.map((t) => t.topic.name),
    };
  });

  return {
    repositories,
    totalCount: searchResult.repositoryCount,
    hasNextPage: searchResult.pageInfo.hasNextPage,
    endCursor: searchResult.pageInfo.endCursor,
  };
}
