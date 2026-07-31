import { fetchGraphQL, getGitHubOwnerAndRepo, GitHubApiError } from "./client";
import {
  GET_DISCUSSIONS,
  GET_DISCUSSION_BY_NUMBER,
  GET_CATEGORIES,
  GET_USER_PROFILE,
  SEARCH_DISCUSSIONS,
  GET_REPOSITORY_ID,
} from "./queries";
import { CREATE_DISCUSSION, ADD_COMMENT, ADD_REACTION, REMOVE_REACTION, DELETE_COMMENT, CLOSE_DISCUSSION, REOPEN_DISCUSSION } from "./mutations";
import {
  Discussion,
  Category,
  GitHubUserProfile,
  DiscussionFilters,
  ReactionContent,
  Comment,
} from "@/types/github";

export * from "./client";
export * from "./queries";
export * from "./mutations";

/**
 * Fetch a paginated list of discussions from GitHub repository.
 */
export async function getDiscussions(
  filters: DiscussionFilters = {},
  userToken?: string
): Promise<{
  discussions: Discussion[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string | null;
    endCursor?: string | null;
  };
}> {
  const { owner, name } = getGitHubOwnerAndRepo();
  const variables = {
    owner,
    name,
    first: filters.first || 20,
    after: filters.after || null,
    before: filters.before || null,
    last: filters.last || null,
    categoryId: filters.categoryId || null,
    orderBy: filters.orderBy || "CREATED_AT",
    direction: filters.direction || "DESC",
  };

  const data = await fetchGraphQL<{
    repository: {
      discussions: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor?: string | null;
          endCursor?: string | null;
        };
        nodes: Discussion[];
      };
    };
  }>(GET_DISCUSSIONS, variables, userToken);

  return {
    discussions: data?.repository?.discussions?.nodes || [],
    totalCount: data?.repository?.discussions?.totalCount || 0,
    pageInfo: data?.repository?.discussions?.pageInfo || {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

/**
 * Fetch a single discussion by discussion number.
 */
export async function getDiscussionByNumber(
  number: number,
  commentsFirst = 50,
  commentsAfter?: string,
  userToken?: string
): Promise<Discussion | null> {
  const { owner, name } = getGitHubOwnerAndRepo();
  const data = await fetchGraphQL<{
    repository: {
      discussion: Discussion | null;
    };
  }>(
    GET_DISCUSSION_BY_NUMBER,
    { owner, name, number, commentsFirst, commentsAfter },
    userToken
  );

  return data?.repository?.discussion || null;
}

import { sanitizeCategoryName, sanitizeCategoryEmoji } from "@/lib/utils";

/**
 * Fetch discussion categories for the repository.
 */
export async function getCategories(userToken?: string): Promise<Category[]> {
  const { owner, name } = getGitHubOwnerAndRepo();
  const data = await fetchGraphQL<{
    repository: {
      discussionCategories: {
        nodes: Category[];
      };
    };
  }>(GET_CATEGORIES, { owner, name }, userToken);

  const rawNodes = data?.repository?.discussionCategories?.nodes || [];
  return rawNodes.map((cat) => ({
    ...cat,
    name: sanitizeCategoryName(cat.name),
    emoji: sanitizeCategoryEmoji(cat.emoji, cat.name),
  }));
}

/**
 * Search discussions using GitHub search syntax.
 */
export async function searchDiscussions(
  searchTerm: string,
  first = 20,
  after?: string,
  userToken?: string
): Promise<{
  discussions: Discussion[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string | null;
    endCursor?: string | null;
  };
}> {
  const { owner, name } = getGitHubOwnerAndRepo();
  const trimmed = searchTerm.trim();
  const searchQuery = `repo:${owner}/${name} is:discussion ${trimmed}`;

  const data = await fetchGraphQL<{
    search: {
      discussionCount: number;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor?: string | null;
        endCursor?: string | null;
      };
      nodes: Discussion[];
    };
  }>(SEARCH_DISCUSSIONS, { searchQuery, first, after }, userToken);

  const rawNodes = data?.search?.nodes || [];
  const discussions = rawNodes.map((d) => ({
    ...d,
    category: d.category
      ? {
          ...d.category,
          name: sanitizeCategoryName(d.category.name),
          emoji: sanitizeCategoryEmoji(d.category.emoji, d.category.name),
        }
      : d.category,
  }));

  return {
    discussions,
    totalCount: data?.search?.discussionCount || discussions.length,
    pageInfo: data?.search?.pageInfo || {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

/**
 * Fetch user profile from GitHub.
 */
export async function getUserProfile(
  login: string,
  userToken?: string
): Promise<GitHubUserProfile | null> {
  const data = await fetchGraphQL<{ user: GitHubUserProfile | null }>(
    GET_USER_PROFILE,
    { login },
    userToken
  );

  return data?.user || null;
}

/**
 * Get repository node ID.
 */
export async function getRepositoryId(userToken?: string): Promise<string> {
  const { owner, name } = getGitHubOwnerAndRepo();
  const data = await fetchGraphQL<{
    repository: {
      id: string;
    };
  }>(GET_REPOSITORY_ID, { owner, name }, userToken);

  if (!data?.repository?.id) {
    throw new GitHubApiError("Could not retrieve repository ID.", 404);
  }

  return data.repository.id;
}

/**
 * Create a new discussion.
 */
export async function createDiscussion(
  input: { title: string; body: string; categoryId: string },
  userToken?: string
): Promise<Discussion> {
  if (!userToken) {
    throw new GitHubApiError("Authentication required. Please sign in with GitHub to post discussions.", 401);
  }
  const repositoryId = await getRepositoryId(userToken);

  const data = await fetchGraphQL<{
    createDiscussion: {
      discussion: Discussion;
    };
  }>(
    CREATE_DISCUSSION,
    {
      repositoryId,
      categoryId: input.categoryId,
      title: input.title,
      body: input.body,
    },
    userToken
  );

  return data.createDiscussion.discussion;
}

/**
 * Add a comment to a discussion or reply to an existing comment.
 */
export async function addComment(
  input: { discussionId: string; body: string; replyToId?: string },
  userToken?: string
): Promise<Comment> {
  if (!userToken) {
    throw new GitHubApiError("Authentication required. Please sign in with GitHub to post comments.", 401);
  }
  const data = await fetchGraphQL<{
    addDiscussionComment: {
      comment: Comment;
    };
  }>(
    ADD_COMMENT,
    {
      discussionId: input.discussionId,
      body: input.body,
      replyToId: input.replyToId || null,
    },
    userToken
  );

  return data.addDiscussionComment.comment;
}

/**
 * Add a reaction to a discussion or comment.
 */
export async function addReaction(
  input: { subjectId: string; content: ReactionContent },
  userToken?: string
): Promise<{ id: string; content: ReactionContent }> {
  if (!userToken) {
    throw new GitHubApiError("Authentication required. Please sign in with GitHub to react.", 401);
  }
  const data = await fetchGraphQL<{
    addReaction: {
      reaction: {
        id: string;
        content: ReactionContent;
      };
    };
  }>(
    ADD_REACTION,
    {
      subjectId: input.subjectId,
      content: input.content,
    },
    userToken
  );

  return data.addReaction.reaction;
}

/**
 * Remove a reaction from a discussion or comment.
 */
export async function removeReaction(
  input: { subjectId: string; content: ReactionContent },
  userToken?: string
): Promise<{ id: string; content: ReactionContent }> {
  if (!userToken) {
    throw new GitHubApiError("Authentication required. Please sign in with GitHub to remove reactions.", 401);
  }
  const data = await fetchGraphQL<{
    removeReaction: {
      reaction: {
        id: string;
        content: ReactionContent;
      };
    };
  }>(
    REMOVE_REACTION,
    {
      subjectId: input.subjectId,
      content: input.content,
    },
    userToken
  );

  return data.removeReaction.reaction;
}

/**
 * Delete a discussion comment.
 */
export async function deleteComment(
  commentId: string,
  userToken?: string
): Promise<string> {
  if (!userToken) {
    throw new GitHubApiError("Authentication required. Please sign in with GitHub to delete comments.", 401);
  }
  const data = await fetchGraphQL<{
    deleteDiscussionComment: {
      comment: {
        id: string;
      };
    };
  }>(DELETE_COMMENT, { id: commentId }, userToken);

  return data.deleteDiscussionComment.comment.id;
}

/**
 * Close a discussion.
 */
export async function closeDiscussion(
  discussionId: string,
  reason: "RESOLVED" | "OUTDATED" | "DUPLICATE" | "STALE" = "RESOLVED",
  userToken?: string
): Promise<any> {
  if (!userToken) {
    throw new GitHubApiError("Authentication required. Please sign in with GitHub to close discussions.", 401);
  }
  const data = await fetchGraphQL(
    CLOSE_DISCUSSION,
    { discussionId, reason },
    userToken
  );
  return data?.closeDiscussion?.discussion;
}

/**
 * Reopen a discussion.
 */
export async function reopenDiscussion(
  discussionId: string,
  userToken?: string
): Promise<any> {
  if (!userToken) {
    throw new GitHubApiError("Authentication required. Please sign in with GitHub to reopen discussions.", 401);
  }
  const data = await fetchGraphQL(
    REOPEN_DISCUSSION,
    { discussionId },
    userToken
  );
  return data?.reopenDiscussion?.discussion;
}
