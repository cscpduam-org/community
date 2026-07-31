import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCategories, GitHubApiError } from "@/lib/github";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    const userToken = session?.accessToken;

    const categories = await getCategories(userToken);

    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
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
      { error: "An unexpected error occurred while fetching categories" },
      { status: 500 }
    );
  }
}
