import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getDiscussions,
  searchDiscussions,
  createDiscussion,
  GitHubApiError,
} from "@/lib/github";
import { DiscussionFilters } from "@/types/github";

export const runtime = "edge";


export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userToken = session?.accessToken;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const categoryId = searchParams.get("categoryId") || searchParams.get("category") || undefined;
    const orderBy = (searchParams.get("orderBy") as "CREATED_AT" | "UPDATED_AT") || "CREATED_AT";
    const direction = (searchParams.get("direction") as "ASC" | "DESC") || "DESC";
    const firstParam = searchParams.get("first");
    const first = firstParam ? parseInt(firstParam, 10) : 20;
    const after = searchParams.get("after") || undefined;

    if (search) {
      const results = await searchDiscussions(search, first, after, userToken);
      return NextResponse.json(results, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }

    const filters: DiscussionFilters = {
      categoryId,
      orderBy,
      direction,
      first,
      after,
    };

    const results = await getDiscussions(filters, userToken);
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
      { error: "An unexpected error occurred while fetching discussions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication required to create a discussion" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, body: content, categoryId } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required and must not be empty" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Body content is required and must not be empty" },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string" || categoryId.trim().length === 0) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const newDiscussion = await createDiscussion(
      {
        title: title.trim(),
        body: content.trim(),
        categoryId: categoryId.trim(),
      },
      session.accessToken
    );

    return NextResponse.json(newDiscussion, { status: 201 });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { error: error.message, isRateLimit: error.isRateLimit },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while creating discussion" },
      { status: 500 }
    );
  }
}
