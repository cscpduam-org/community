import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addComment, deleteComment, GitHubApiError } from "@/lib/github";

export const runtime = "edge";


export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication required to add a comment" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { discussionId, body: commentBody, replyToId } = body;

    if (!discussionId || typeof discussionId !== "string") {
      return NextResponse.json(
        { error: "Discussion ID is required" },
        { status: 400 }
      );
    }

    if (!commentBody || typeof commentBody !== "string" || commentBody.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const newComment = await addComment(
      {
        discussionId: discussionId.trim(),
        body: commentBody.trim(),
        replyToId: replyToId ? replyToId.trim() : undefined,
      },
      session.accessToken
    );

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { error: error.message, isRateLimit: error.isRateLimit },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while adding comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication required to delete a comment" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId") || searchParams.get("id");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    const deletedId = await deleteComment(commentId, session.accessToken);
    return NextResponse.json({ id: deletedId });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { error: error.message, isRateLimit: error.isRateLimit },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting comment" },
      { status: 500 }
    );
  }
}
