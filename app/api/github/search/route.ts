import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchDiscussions, GitHubApiError } from "@/lib/github";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userToken = session?.accessToken;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query");
    const firstParam = searchParams.get("first");
    const first = firstParam ? parseInt(firstParam, 10) : 20;
    const after = searchParams.get("after") || undefined;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          discussions: [],
          totalCount: 0,
          pageInfo: { hasNextPage: false, hasPreviousPage: false },
        },
        { status: 200 }
      );
    }

    const results = await searchDiscussions(query.trim(), first, after, userToken);

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { error: error.message, isRateLimit: error.isRateLimit },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while searching discussions" },
      { status: 500 }
    );
  }
}
