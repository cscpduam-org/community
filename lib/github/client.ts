import { graphql, GraphqlResponseError } from "@octokit/graphql";

export class GitHubApiError extends Error {
  public status?: number;
  public errors?: Array<{ message: string; type?: string; path?: string[] }>;
  public isRateLimit: boolean;

  constructor(
    message: string,
    status?: number,
    errors?: Array<{ message: string; type?: string; path?: string[] }>,
    isRateLimit = false
  ) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.errors = errors;
    this.isRateLimit = isRateLimit;
  }
}

export function getGitHubOwnerAndRepo(): { owner: string; name: string } {
  const owner = process.env.GITHUB_OWNER || "cscpduam-org";
  const name = process.env.GITHUB_REPOSITORY || "community";
  return { owner, name };
}

export function getGitHubToken(userToken?: string): string | null {
  const token =
    userToken ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN ||
    process.env.GITHUB_CLIENT_SECRET;

  return token || null;
}

export async function fetchGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {},
  userToken?: string
): Promise<T> {
  const token = getGitHubToken(userToken);

  if (!token) {
    console.warn(
      "[GitHub API] No authentication token found. To allow guest users to browse public discussions without logging in, set GITHUB_TOKEN in your .env.local file."
    );
    return {} as T;
  }

  try {
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `bearer ${token}`,
      },
    });

    const response = await graphqlWithAuth<T>(query, variables);
    return response;
  } catch (error) {
    if (error instanceof GraphqlResponseError) {
      const errStatus = (error as any).status;
      const isRateLimit =
        error.errors?.some((e) =>
          e.message.toLowerCase().includes("rate limit")
        ) || errStatus === 403;

      const errorMessage =
        error.errors?.map((e) => e.message).join("; ") || error.message;

      throw new GitHubApiError(
        isRateLimit
          ? "GitHub API rate limit exceeded. Please try again later."
          : `GitHub GraphQL API Error: ${errorMessage}`,
        errStatus,
        error.errors as any,
        isRateLimit
      );
    }

    if (error instanceof Error) {
      throw new GitHubApiError(error.message, 500);
    }

    throw new GitHubApiError("An unknown error occurred while querying GitHub API", 500);
  }
}
