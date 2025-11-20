// src/lib/github/client.ts
import { env } from "~/env";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export class GitHubClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async query<T extends object>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[github api] error:", errorText);
      throw new Error(`github api error: ${response.statusText}`);
    }

    const data = (await response.json()) as GraphQLResponse<T>;

    if (data.errors) {
      console.error(
        "[github api] graphql errors:",
        JSON.stringify(data.errors, null, 2),
      );
      throw new Error(`graphql errors: ${JSON.stringify(data.errors)}`);
    }

    // log rate limit if available (type-safe)
    const result = data.data as T & {
      rateLimit?: { remaining: number; cost: number; resetAt: string };
    };
    if (result.rateLimit) {
      console.log(
        `[github api] rate limit: ${result.rateLimit.remaining}/5000, cost: ${result.rateLimit.cost}, resets at: ${result.rateLimit.resetAt}`,
      );
    }

    return data.data;
  }
}

// singleton instance
export const githubClient = new GitHubClient(env.GITHUB_TOKEN);
