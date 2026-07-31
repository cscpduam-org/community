import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { getCategories, getDiscussions } from "@/lib/github";
import { DiscussionList } from "@/components/discussion/DiscussionList";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

interface CategoryDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

const STATIC_METADATA_MAP: Record<
  string,
  { name: string; emoji: string; description: string }
> = {
  announcements: {
    name: "Announcements",
    emoji: "📢",
    description:
      "Official department updates, announcements, and notices from faculty and maintainers.",
  },
  general: {
    name: "General",
    emoji: "💬",
    description:
      "Open discussion, casual tech conversations, and general topics around computer science.",
  },
  "q-a": {
    name: "Q&A",
    emoji: "❓",
    description:
      "Technical questions, homework help, troubleshooting, and problem-solving assistance.",
  },
  qna: {
    name: "Q&A",
    emoji: "❓",
    description:
      "Technical questions, homework help, troubleshooting, and problem-solving assistance.",
  },
  ideas: {
    name: "Ideas",
    emoji: "💡",
    description:
      "Community proposals, project concepts, department feature requests, and brainstorming.",
  },
  projects: {
    name: "Projects",
    emoji: "🚀",
    description:
      "Student open-source projects, team collaboration requests, showcase repositories, and demos.",
  },
  resources: {
    name: "Resources",
    emoji: "📚",
    description:
      "Study guides, learning roadmaps, textbook recommendations, online courses, and cheat sheets.",
  },
  events: {
    name: "Events",
    emoji: "📅",
    description:
      "Hackathons, tech workshops, guest lectures, department webinars, and community meetups.",
  },
  showcase: {
    name: "Showcase",
    emoji: "✨",
    description:
      "Share portfolio websites, tech achievements, awards, and completed projects.",
  },
};

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();

  const staticInfo = STATIC_METADATA_MAP[slug];
  const title = staticInfo
    ? `${staticInfo.name} Discussions | CSCPDUAM Community`
    : `${slug.toUpperCase()} | CSCPDUAM Community`;
  const description = staticInfo
    ? staticInfo.description
    : `Browse discussions in category ${slug} on CSCPDUAM Community.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const session = await auth();
  const userToken = session?.accessToken;

  const categorySlug = resolvedParams.slug.toLowerCase();
  const currentSort = resolvedSearchParams.sort || "latest";

  let categories: any[] = [];
  let categoryObj: any = null;
  let discussions: any[] = [];

  try {
    categories = (await getCategories(userToken)) || [];

    // Match category by slug, ID, or name
    categoryObj = categories.find(
      (c) =>
        c.slug === categorySlug ||
        c.id === categorySlug ||
        c.name.toLowerCase() === categorySlug.replace("-", " ") ||
        c.name.toLowerCase() === categorySlug
    );

    // Fallback to static info if not matched from remote
    const staticInfo = STATIC_METADATA_MAP[categorySlug];
    const categoryName = categoryObj?.name || staticInfo?.name || categorySlug;
    const categoryEmoji = categoryObj?.emoji || staticInfo?.emoji || "💬";
    const categoryDesc =
      categoryObj?.description ||
      staticInfo?.description ||
      `Discussions categorized under ${categoryName}.`;

    const categoryIdToFetch = categoryObj?.id;

    const discussionsRes = await getDiscussions(
      {
        categoryId: categoryIdToFetch || undefined,
        orderBy: currentSort === "top" ? "UPDATED_AT" : "CREATED_AT",
        direction: "DESC",
        first: 30,
      },
      userToken
    );

    discussions = discussionsRes.discussions || [];

    // Filter by category name if categoryId was unavailable
    if (!categoryIdToFetch) {
      discussions = discussions.filter(
        (d) =>
          d.category?.name?.toLowerCase() === categoryName.toLowerCase() ||
          d.category?.slug === categorySlug
      );
    }

    if (currentSort === "unanswered") {
      discussions = discussions.filter((d) => !d.isAnswered);
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Category Content */}
          <main id="main-content" className="flex-1 min-w-0 space-y-6">
            {/* Navigation back */}
            <div>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>All Categories</span>
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" role="img" aria-label={categoryName}>
                      {categoryEmoji}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {categoryName}
                    </h1>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                    {categoryDesc}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href="/search">
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">Search</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="gap-2 shadow-xs">
                    <Link href="/discussions/new">
                      <Plus className="h-4 w-4" />
                      <span>New Discussion</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Sorting controls */}
            <div className="flex items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/80">
              <div
                role="tablist"
                aria-label="Category discussions sorting"
                className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs font-semibold text-muted-foreground"
              >
                <Link
                  role="tab"
                  aria-selected={currentSort === "latest"}
                  href={`/categories/${categorySlug}?sort=latest`}
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
                  href={`/categories/${categorySlug}?sort=top`}
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
                  href={`/categories/${categorySlug}?sort=unanswered`}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currentSort === "unanswered"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "hover:text-foreground"
                  }`}
                >
                  Unanswered
                </Link>
              </div>

              <span className="text-xs text-muted-foreground font-semibold">
                {discussions.length} {discussions.length === 1 ? "Discussion" : "Discussions"}
              </span>
            </div>

            {/* Discussion List */}
            <DiscussionList
              discussions={discussions}
              emptyTitle={`No discussions in ${categoryName}`}
              emptyDescription={`Be the first to start a conversation in ${categoryName}!`}
              newDiscussionHref="/discussions/new"
            />
          </main>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    );
  } catch (err: any) {
    console.error(`Error loading category ${categorySlug}:`, err);
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex-1">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-4">
          <p className="font-semibold text-destructive">Unable to load category discussions</p>
          <p className="text-xs text-muted-foreground">{err.message || "An unexpected error occurred."}</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/categories">Return to Categories</Link>
          </Button>
        </div>
      </div>
    );
  }
}
