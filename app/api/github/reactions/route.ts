import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addReaction, removeReaction, GitHubApiError } from "@/lib/github";
import { ReactionContent } from "@/types/github";

export const runtime = "edge";


const VALID_REACTIONS: ReactionContent[] = [
  "THUMBS_UP",
  "THUMBS_DOWN",
  "LAUGH",
  "HOORAY",
  "CONFUSED",
  "HEART",
  "ROCKET",
  "EYES",
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication required to modify reaction" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subjectId, content, action = "add" } = body;

    if (!subjectId || typeof subjectId !== "string") {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    if (!content || !VALID_REACTIONS.includes(content as ReactionContent)) {
      return NextResponse.json(
        { error: "Invalid reaction content" },
        { status: 400 }
      );
    }

    if (action === "remove") {
      const reaction = await removeReaction(
        {
          subjectId: subjectId.trim(),
          content: content as ReactionContent,
        },
        session.accessToken
      );
      return NextResponse.json(reaction, { status: 200 });
    } else {
      const reaction = await addReaction(
        {
          subjectId: subjectId.trim(),
          content: content as ReactionContent,
        },
        session.accessToken
      );
      return NextResponse.json(reaction, { status: 201 });
    }
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { error: error.message, isRateLimit: error.isRateLimit },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while modifying reaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication required to remove reaction" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subjectId, content } = body;

    if (!subjectId || !content) {
      return NextResponse.json(
        { error: "Subject ID and reaction content are required" },
        { status: 400 }
      );
    }

    const reaction = await removeReaction(
      {
        subjectId: subjectId.trim(),
        content: content as ReactionContent,
      },
      session.accessToken
    );

    return NextResponse.json(reaction, { status: 200 });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { error: error.message, isRateLimit: error.isRateLimit },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while removing reaction" },
      { status: 500 }
    );
  }
}
