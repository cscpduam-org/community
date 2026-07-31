import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Sparkles, ArrowRight, Flame, Plus } from "lucide-react";
import { auth } from "@/auth";
import { getDiscussions } from "@/lib/github";
import { DiscussionList } from "@/components/discussion/DiscussionList";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Community | CSCPDUAMA",
};

export default async function HomePage() {
  const session = await auth();
  const userToken = session?.accessToken;

  let discussions: any[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await getDiscussions({ first: 20, orderBy: "CREATED_AT", direction: "DESC" }, userToken);
    discussions = res?.discussions || [];
  } catch (err: any) {
    console.error("Error loading homepage discussions:", err);
    errorMsg = err.message || "Failed to load latest discussions.";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <main id="main-content" className="flex-1 min-w-0 space-y-8">
          {/* Welcome Banner / Hero section with grid pattern */}
          <section className="relative overflow-hidden rounded-[24px] border border-border bg-card p-6 sm:p-10 shadow-xs grid-pattern">
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>PDUAM, Amjonga, Goalpara-Assam</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Welcome to CSCPDUAMA
              </h1>
              
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Connect with peers, collaborate on technical projects, ask computer science questions, and access department discussions.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="default" className="gap-2">
                  <Link href="/discussions">
                    <MessageSquare className="h-4 w-4" />
                    <span>Browse Discussions</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="default">
                  <Link href="/categories">
                    <span>Explore Categories</span>
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Latest Discussions Feed */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <Flame className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Latest Discussions
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
                  <Link href="/discussions">
                    <span>View All</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                
                <Button asChild size="sm" className="gap-1 px-3">
                  <Link href="/discussions/new">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Post</span>
                  </Link>
                </Button>
              </div>
            </div>

            {errorMsg ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-2">
                <p className="font-semibold text-destructive">Unable to fetch discussions</p>
                <p className="text-xs text-muted-foreground">{errorMsg}</p>
              </div>
            ) : (
              <DiscussionList
                discussions={discussions}
                emptyTitle="No discussions found"
                emptyDescription="No discussions have been posted yet. Be the first to start a conversation!"
                newDiscussionHref="/discussions/new"
              />
            )}
          </section>
        </main>

        {/* Desktop Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
