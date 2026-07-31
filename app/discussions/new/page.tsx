import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Lock, ArrowLeft, Github, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { getCategories } from "@/lib/github";
import { DiscussionEditor } from "@/components/discussion/DiscussionEditor";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/github";

export const runtime = "edge";


export const metadata: Metadata = {
  title: "New Discussion",
  description:
    "Create a new discussion in CSCPDUAM Community. Ask technical questions, share project ideas, or post department announcements.",
};

export default async function NewDiscussionPage() {
  const session = await auth();

  // If user is guest / unauthenticated
  if (!session || !session.user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex-1 w-full flex flex-col justify-center items-center">
        <div className="w-full rounded-[24px] border border-border bg-card p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Sign In to Post a Discussion
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              To keep the CSCPDUAM Community safe and productive, you must be signed in with your GitHub account before creating a discussion.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 px-8 shadow-sm">
              <Link href="/auth/signin?callbackUrl=/discussions/new">
                <Github className="h-5 w-5" />
                <span>Sign in with GitHub</span>
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <Link href="/discussions">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Discussions</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fetch initial categories for editor server-side
  let categories: Category[] = [];
  try {
    categories = await getCategories(session.accessToken);
  } catch (error) {
    console.error("Error fetching categories for new discussion page:", error);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
      {/* Navigation Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/discussions"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Discussions</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Signed in as @{session.user.login || session.user.name}</span>
        </span>
      </div>

      {/* Discussion Editor Host Component */}
      <main id="main-content">
        <DiscussionEditor categories={categories} />
      </main>
    </div>
  );
}
