import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { closeDiscussion, reopenDiscussion, GitHubApiError } from "@/lib/github";

export const runtime = "edge";


export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication required to close or reopen discussion" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { discussionId, action = "close", reason = "RESOLVED" } = body;

    if (!discussionId || typeof discussionId !== "string") {
      return NextResponse.json(
        { error: "Discussion ID is required" },
        { status: 400 }
      );
    }

    if (action === "reopen") {
      const res = await reopenDiscussion(discussionId.trim(), session.accessToken);
      return NextResponse.json({ success: true, discussion: res }, { status: 200 });
    } else {
      const res = await closeDiscussion(
        discussionId.trim(),
        reason as "RESOLVED" | "OUTDATED" | "DUPLICATE" | "STALE",
        session.accessToken
      );
      return NextResponse.json({ success: true, discussion: res }, { status: 200 });
    }
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { error: error.message, isRateLimit: error.isRateLimit },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while updating discussion status" },
      { status: 500 }
    );
  }
}
