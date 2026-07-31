export type ReactionContent =
  | "THUMBS_UP"
  | "THUMBS_DOWN"
  | "LAUGH"
  | "HOORAY"
  | "CONFUSED"
  | "HEART"
  | "ROCKET"
  | "EYES";

export interface Author {
  login: string;
  avatarUrl: string;
  url: string;
  name?: string | null;
}

export interface Reaction {
  id: string;
  content: ReactionContent;
  user: Author;
}

export interface ReactionGroup {
  content: ReactionContent;
  users: {
    totalCount: number;
  };
  viewerHasReacted: boolean;
}

export interface Comment {
  id: string;
  body: string;
  bodyHTML?: string;
  createdAt: string;
  updatedAt?: string;
  author: Author;
  viewerCanUpdate?: boolean;
  viewerCanDelete?: boolean;
  reactionGroups?: ReactionGroup[];
  replies?: {
    totalCount: number;
    nodes: Comment[];
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  isAnswerable?: boolean;
}

export interface Discussion {
  id: string;
  number: number;
  title: string;
  body: string;
  bodyHTML?: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  locked: boolean;
  closed?: boolean;
  closedAt?: string | null;
  isAnswered: boolean;
  isPinned?: boolean;
  author: Author;
  category: Category;
  comments: {
    totalCount: number;
    nodes?: Comment[];
    pageInfo?: PageInfo;
  };
  reactions?: {
    totalCount: number;
    nodes?: Reaction[];
  };
  reactionGroups?: ReactionGroup[];
  answer?: Comment | null;
  viewerCanReact?: boolean;
  viewerCanUpdate?: boolean;
  viewerCanDelete?: boolean;
  viewerCanClose?: boolean;
  viewerCanReopen?: boolean;
}

export interface PageInfo {
  startCursor?: string | null;
  endCursor?: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DiscussionFilters {
  categoryId?: string;
  search?: string;
  orderBy?: "CREATED_AT" | "UPDATED_AT";
  direction?: "ASC" | "DESC";
  first?: number;
  after?: string;
  before?: string;
  last?: number;
}

export interface GitHubUserProfile {
  id: string;
  login: string;
  name?: string | null;
  avatarUrl: string;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  twitterUsername?: string | null;
  followers: {
    totalCount: number;
  };
  following: {
    totalCount: number;
  };
  repositories: {
    nodes: Array<{
      id: string;
      name: string;
      description?: string | null;
      stargazerCount: number;
      forkCount: number;
      url: string;
      primaryLanguage?: {
        name: string;
        color: string;
      } | null;
    }>;
  };
}

export interface GitHubPaginatedResponse<T> {
  nodes: T[];
  totalCount: number;
  pageInfo: PageInfo;
}

export interface GitHubRateLimit {
  limit: number;
  cost: number;
  remaining: number;
  resetAt: string;
}
