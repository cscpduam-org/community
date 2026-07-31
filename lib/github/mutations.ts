export const CREATE_DISCUSSION = `
  mutation CreateDiscussion($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
    createDiscussion(input: { repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body }) {
      discussion {
        id
        number
        title
        body
        url
        createdAt
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
        }
      }
    }
  }
`;

export const ADD_COMMENT = `
  mutation AddComment($discussionId: ID!, $body: String!, $replyToId: ID) {
    addDiscussionComment(input: { discussionId: $discussionId, body: $body, replyToId: $replyToId }) {
      comment {
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
`;

export const ADD_REACTION = `
  mutation AddReaction($subjectId: ID!, $content: ReactionContent!) {
    addReaction(input: { subjectId: $subjectId, content: $content }) {
      reaction {
        id
        content
        user {
          login
        }
      }
    }
  }
`;

export const DELETE_COMMENT = `
  mutation DeleteComment($id: ID!) {
    deleteDiscussionComment(input: { id: $id }) {
      comment {
        id
      }
    }
  }
`;

export const REMOVE_REACTION = `
  mutation RemoveReaction($subjectId: ID!, $content: ReactionContent!) {
    removeReaction(input: { subjectId: $subjectId, content: $content }) {
      reaction {
        id
        content
      }
    }
  }
`;

export const CLOSE_DISCUSSION = `
  mutation CloseDiscussion($discussionId: ID!, $reason: DiscussionCloseReason) {
    closeDiscussion(input: { discussionId: $discussionId, reason: $reason }) {
      discussion {
        id
        closed
        closedAt
      }
    }
  }
`;

export const REOPEN_DISCUSSION = `
  mutation ReopenDiscussion($discussionId: ID!) {
    reopenDiscussion(input: { discussionId: $discussionId }) {
      discussion {
        id
        closed
        closedAt
      }
    }
  }
`;
