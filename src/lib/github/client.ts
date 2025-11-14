import { env } from "~/env";

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

export interface GitHubSearchResponse {
  repositories: GitHubRepository[];
  totalCount: number;
  hasNextPage: boolean;
  endCursor: string | null;
}

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

export class GitHubClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async searchRepositories(
    query: string,
    first = 20,
    after?: string,
  ): Promise<GitHubSearchResponse> {
    const graphqlQuery = `
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

    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          query,
          first,
          after: after ?? null,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", errorText);
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", JSON.stringify(data.errors, null, 2));
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const searchResult = data.data.search;

    const repositories: GitHubRepository[] = searchResult.edges.map(
      (edge: any) => {
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
          topics: node.repositoryTopics.nodes.map((t: any) => t.topic.name),
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
          hasIssueTemplate:
            node.issueTemplates && node.issueTemplates.length > 0,
          repositoryTopics: node.repositoryTopics.nodes.map(
            (t: any) => t.topic.name,
          ),
        };
      },
    );

    return {
      repositories,
      totalCount: searchResult.repositoryCount,
      hasNextPage: searchResult.pageInfo.hasNextPage,
      endCursor: searchResult.pageInfo.endCursor,
    };
  }
}

// Singleton instance
export const githubClient = new GitHubClient(env.GITHUB_TOKEN);
