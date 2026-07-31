export const GET_DISCUSSIONS = `
  query GetDiscussions(
    $owner: String!
    $name: String!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $categoryId: ID
    $orderBy: DiscussionOrderField! = CREATED_AT
    $direction: OrderDirection! = DESC
  ) {
    repository(owner: $owner, name: $name) {
      discussions(
        first: $first
        after: $after
        last: $last
        before: $before
        categoryId: $categoryId
        orderBy: { field: $orderBy, direction: $direction }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
          id
          number
          title
          body
          bodyHTML
          createdAt
          updatedAt
          url
          locked
          closed
          closedAt
          isAnswered
          viewerCanClose
          viewerCanReopen
          author {
            login
            avatarUrl
            url
          }
          category {
            id
            name
            slug
            emoji
            description
          }
          comments {
            totalCount
          }
          reactions {
            totalCount
          }
          reactionGroups {
            content
            users {
              totalCount
            }
            viewerHasReacted
          }
        }
      }
    }
  }
`;

export const GET_DISCUSSION_BY_NUMBER = `
  query GetDiscussionByNumber(
    $owner: String!
    $name: String!
    $number: Int!
    $commentsFirst: Int = 50
    $commentsAfter: String
  ) {
    repository(owner: $owner, name: $name) {
      discussion(number: $number) {
        id
        number
        title
        body
        bodyHTML
        createdAt
        updatedAt
        url
        locked
        closed
        closedAt
        isAnswered
        viewerCanReact
        viewerCanUpdate
        viewerCanDelete
        viewerCanClose
        viewerCanReopen
        author {
          login
          avatarUrl
          url
        }
        category {
          id
          name
          slug
          emoji
          description
        }
        answer {
          id
          body
          bodyHTML
          createdAt
          author {
            login
            avatarUrl
            url
          }
        }
        comments(first: $commentsFirst, after: $commentsAfter) {
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          nodes {
            id
            body
            bodyHTML
            createdAt
            updatedAt
            viewerCanUpdate
            viewerCanDelete
            author {
              login
              avatarUrl
              url
            }
            reactionGroups {
              content
              users {
                totalCount
              }
              viewerHasReacted
            }
            replies(first: 20) {
              totalCount
              nodes {
                id
                body
                bodyHTML
                createdAt
                author {
                  login
                  avatarUrl
                  url
                }
              }
            }
          }
        }
        reactionGroups {
          content
          users {
            totalCount
          }
          viewerHasReacted
        }
      }
    }
  }
`;

export const GET_CATEGORIES = `
  query GetCategories($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussionCategories(first: 50) {
        totalCount
        nodes {
          id
          name
          slug
          emoji
          description
          isAnswerable
        }
      }
    }
  }
`;

export const GET_USER_PROFILE = `
  query GetUserProfile($login: String!) {
    user(login: $login) {
      id
      login
      name
      avatarUrl
      bio
      company
      location
      websiteUrl
      twitterUsername
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(first: 6, privacy: PUBLIC, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
        nodes {
          id
          name
          description
          stargazerCount
          forkCount
          url
          primaryLanguage {
            name
            color
          }
        }
      }
    }
  }
`;

export const SEARCH_DISCUSSIONS = `
  query SearchDiscussions($searchQuery: String!, $first: Int = 20, $after: String) {
    search(query: $searchQuery, type: DISCUSSION, first: $first, after: $after) {
      discussionCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        ... on Discussion {
          id
          number
          title
          body
          bodyHTML
          createdAt
          updatedAt
          url
          locked
          closed
          closedAt
          isAnswered
          viewerCanClose
          viewerCanReopen
          author {
            login
            avatarUrl
            url
          }
          category {
            id
            name
            slug
            emoji
            description
          }
          comments {
            totalCount
          }
          reactions {
            totalCount
          }
          reactionGroups {
            content
            users {
              totalCount
            }
            viewerHasReacted
          }
        }
      }
    }
  }
`;

export const GET_REPOSITORY_ID = `
  query GetRepositoryId($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
    }
  }
`;
