import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { getCategories, getDiscussions } from "@/lib/github";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { sanitizeCategoryName, sanitizeCategoryEmoji } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export const runtime = "edge";


export const metadata: Metadata = {
  title: "Categories",
  description:
    "Explore CSCPDUAM discussion categories including Announcements, General, Q&A, Ideas, Projects, Resources, Events, and Showcase.",
};

const CATEGORIES_METADATA = [
  {
    slug: "announcements",
    name: "Announcements",
    emoji: "📢",
    description:
      "Official department updates, announcements, and notices from faculty and maintainers.",
  },
  {
    slug: "general",
    name: "General",
    emoji: "💬",
    description:
      "Open discussion, casual tech conversations, and general topics around computer science.",
  },
  {
    slug: "q-a",
    name: "Q&A",
    emoji: "❓",
    description:
      "Technical questions, homework help, troubleshooting, and problem-solving assistance.",
  },
  {
    slug: "ideas",
    name: "Ideas",
    emoji: "💡",
    description:
      "Community proposals, project concepts, department feature requests, and brainstorming.",
  },
  {
    slug: "projects",
    name: "Projects",
    emoji: "🚀",
    description:
      "Student open-source projects, team collaboration requests, showcase repositories, and demos.",
  },
  {
    slug: "resources",
    name: "Resources",
    emoji: "📚",
    description:
      "Study guides, learning roadmaps, textbook recommendations, online courses, and cheat sheets.",
  },
  {
    slug: "events",
    name: "Events",
    emoji: "📅",
    description:
      "Hackathons, tech workshops, guest lectures, department webinars, and community meetups.",
  },
  {
    slug: "showcase",
    name: "Showcase",
    emoji: "✨",
    description:
      "Share portfolio websites, tech achievements, awards, and completed projects.",
  },
];

export default async function CategoriesPage() {
  const session = await auth();
  const userToken = session?.accessToken;

  let remoteCategories: any[] = [];
  let discussions: any[] = [];

  try {
    const [cats, discs] = await Promise.all([
      getCategories(userToken),
      getDiscussions({ first: 100 }, userToken),
    ]);
    remoteCategories = cats || [];
    discussions = discs?.discussions || [];
  } catch (error) {
    console.error("Error loading categories page:", error);
  }

  // Count discussions per category
  const categoryCounts: Record<string, number> = {};
  discussions.forEach((d) => {
    if (d.category) {
      const catNameKey = d.category.name?.toLowerCase();
      const catIdKey = d.category.id;
      categoryCounts[catIdKey] = (categoryCounts[catIdKey] || 0) + 1;
      if (catNameKey) {
        categoryCounts[catNameKey] = (categoryCounts[catNameKey] || 0) + 1;
      }
    }
  });

  // Combine remote categories with fallback metadata definitions
  const displayCategories = CATEGORIES_METADATA.map((staticCat) => {
    const matchedRemote = remoteCategories.find(
      (r) =>
        r.name?.toLowerCase() === staticCat.name.toLowerCase() ||
        r.slug === staticCat.slug ||
        r.name?.toLowerCase().includes(staticCat.slug.replace("-", ""))
    );

    const id = matchedRemote ? matchedRemote.id : staticCat.slug;
    const rawName = matchedRemote ? matchedRemote.name : staticCat.name;
    const name = sanitizeCategoryName(rawName);
    const emoji = sanitizeCategoryEmoji(matchedRemote?.emoji, staticCat.name) || staticCat.emoji;
    const description = matchedRemote?.description || staticCat.description;

    const count =
      (matchedRemote ? categoryCounts[matchedRemote.id] : 0) ||
      categoryCounts[name.toLowerCase()] ||
      0;

    return {
      id,
      slug: staticCat.slug,
      name,
      emoji,
      description,
      count,
    };
  });

  // Add any remote categories that weren't in static list
  remoteCategories.forEach((r) => {
    const alreadyIncluded = displayCategories.some(
      (d) => d.id === r.id || d.name.toLowerCase() === r.name.toLowerCase()
    );
    if (!alreadyIncluded) {
      displayCategories.push({
        id: r.id,
        slug: r.slug || r.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        name: r.name,
        emoji: r.emoji || "💬",
        description: r.description || `Browse discussions in ${r.name}`,
        count: categoryCounts[r.id] || categoryCounts[r.name.toLowerCase()] || 0,
      });
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Header Banner */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <FolderKanban className="h-7 w-7 text-primary shrink-0" />
            <span>Discussion Categories</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Explore discussions by topic. Select a category to view specific questions, announcements, resources, or student showcases.
          </p>
        </div>

        <Button asChild size="sm" className="gap-2 self-start md:self-auto">
          <Link href="/discussions/new">
            <Sparkles className="h-4 w-4" />
            <span>Start a Discussion</span>
          </Link>
        </Button>
      </div>

      {/* Grid of Categories */}
      <main id="main-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative flex flex-col justify-between p-6 rounded-[20px] border border-border bg-card hover:bg-accent/40 hover:border-primary/40 transition-all duration-200 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" role="img" aria-label={cat.name}>
                      {cat.emoji}
                    </span>
                    <h2 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h2>
                  </div>
                  <CategoryBadge category={cat.name} size="sm" />
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {cat.count} {cat.count === 1 ? "Discussion" : "Discussions"}
                </span>

                <span className="inline-flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                  <span>Browse</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
