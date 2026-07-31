import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, Filter, MessageSquare } from "lucide-react";
import { getDiscussions, getCategories } from "@/lib/github";
import { DiscussionList } from "@/components/discussion/DiscussionList";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export const runtime = "edge";


export const metadata: Metadata = {
  title: "Discussions",
  description:
    "Browse technical discussions, ask questions, share project ideas, and learn from computer science peers and faculty.",
};

interface DiscussionsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function DiscussionsPage({ searchParams }: DiscussionsPageProps) {
  const params = await searchParams;
  const session = await auth();
  const userToken = session?.accessToken;

  const currentCategoryParam = params.category;
  const currentSort = params.sort || "latest";

  let discussions: any[] = [];
  let categories: any[] = [];
  let errorMsg: string | null = null;
  let selectedCategoryObj: any = null;

  try {
    categories = (await getCategories(userToken)) || [];

    // Match category ID from slug or ID parameter if provided
    if (currentCategoryParam) {
      selectedCategoryObj = categories.find(
        (c) =>
          c.id === currentCategoryParam ||
          c.slug === currentCategoryParam ||
          c.name.toLowerCase() === currentCategoryParam.toLowerCase()
      );
    }

    const categoryIdToFetch = selectedCategoryObj
      ? selectedCategoryObj.id
      : currentCategoryParam;

    const discussionsRes = await getDiscussions(
      {
        categoryId: categoryIdToFetch || undefined,
        orderBy: currentSort === "top" ? "UPDATED_AT" : "CREATED_AT",
        direction: "DESC",
        first: 25,
      },
      userToken
    );

    discussions = discussionsRes.discussions || [];
  } catch (err: any) {
    console.error("Error loading discussions page data:", err);
    errorMsg = err.message || "Failed to load discussions from GitHub.";
  }

  // Filter client-side if unanswered filter selected
  if (currentSort === "unanswered") {
    discussions = discussions.filter((d) => !d.isAnswered);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <main id="main-content" className="flex-1 min-w-0 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                <MessageSquare className="h-7 w-7 text-primary shrink-0" />
                <span>Community Discussions</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedCategoryObj
                  ? `Showing discussions in "${selectedCategoryObj.name}"`
                  : "Explore tech discussions, ask questions, or share knowledge with CSCPDUAM."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/search" aria-label="Search discussions">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-2 shadow-xs">
                <Link href="/discussions/new" aria-label="Create a new discussion">
                  <Plus className="h-4 w-4" />
                  <span>New Discussion</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Filtering & Sorting Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/80">
            {/* Sorting Tabs */}
            <div
              role="tablist"
              aria-label="Discussion sorting options"
              className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs font-semibold text-muted-foreground"
            >
              <Link
                role="tab"
                aria-selected={currentSort === "latest"}
                href={`/discussions?${new URLSearchParams({
                  ...(currentCategoryParam ? { category: currentCategoryParam } : {}),
                  sort: "latest",
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentSort === "latest"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "hover:text-foreground"
                }`}
              >
                Latest
              </Link>
              <Link
                role="tab"
                aria-selected={currentSort === "top"}
                href={`/discussions?${new URLSearchParams({
                  ...(currentCategoryParam ? { category: currentCategoryParam } : {}),
                  sort: "top",
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentSort === "top"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "hover:text-foreground"
                }`}
              >
                Top
              </Link>
              <Link
                role="tab"
                aria-selected={currentSort === "unanswered"}
                href={`/discussions?${new URLSearchParams({
                  ...(currentCategoryParam ? { category: currentCategoryParam } : {}),
                  sort: "unanswered",
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentSort === "unanswered"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "hover:text-foreground"
                }`}
              >
                Unanswered
              </Link>
            </div>

            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                <Filter className="h-3.5 w-3.5" />
                Category:
              </span>
              <Link
                href={`/discussions?sort=${currentSort}`}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 border transition-colors ${
                  !currentCategoryParam
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-accent"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => {
                const isSelected =
                  currentCategoryParam === cat.id ||
                  currentCategoryParam === cat.slug ||
                  currentCategoryParam?.toLowerCase() === cat.name.toLowerCase();
                return (
                  <Link
                    key={cat.id}
                    href={`/discussions?${new URLSearchParams({
                      category: cat.slug || cat.id,
                      sort: currentSort,
                    }).toString()}`}
                    className={`shrink-0 transition-opacity ${
                      isSelected ? "opacity-100 ring-2 ring-primary rounded-full" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <CategoryBadge category={cat.name} size="sm" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Discussion List Component */}
          {errorMsg ? (
            <div
              role="alert"
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2"
            >
              <p className="font-semibold text-destructive">Unable to fetch discussions</p>
              <p className="text-xs text-muted-foreground">{errorMsg}</p>
            </div>
          ) : (
            <DiscussionList
              discussions={discussions}
              emptyTitle="No discussions found"
              emptyDescription="No discussions match your filter criteria. Be the first to start a conversation!"
              newDiscussionHref="/discussions/new"
            />
          )}
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
