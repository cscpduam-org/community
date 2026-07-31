import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Lock, Github, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getUserProfile, getDiscussions } from "@/lib/github";
import { ProfileView } from "@/components/profile/ProfileView";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "View CSCPDUAM user profile, technical contributions, posted discussions, and GitHub repository activity.",
};

interface ProfilePageProps {
  searchParams: Promise<{
    username?: string;
    user?: string;
  }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const session = await auth();

  const usernameParam = params.username || params.user;

  // Determine login handle to load
  const targetLogin =
    usernameParam || session?.user?.login || (session?.user as any)?.username;

  // If no target login handle and guest
  if (!targetLogin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex-1 w-full flex flex-col justify-center items-center">
        <div className="w-full rounded-[24px] border border-border bg-card p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Sign In to View Your Profile
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Sign in with your GitHub account to access your CSCPDUAM Community profile, track your discussions, and manage settings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 px-8 shadow-sm">
              <Link href="/api/auth/signin?callbackUrl=/profile">
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

  let userProfile = null;
  let userDiscussions: any[] = [];

  try {
    const [profileData, discussionsData] = await Promise.all([
      getUserProfile(targetLogin, session?.accessToken),
      getDiscussions({ first: 50 }, session?.accessToken),
    ]);

    userProfile = profileData;

    // Filter discussions authored by targetLogin
    if (discussionsData?.discussions) {
      userDiscussions = discussionsData.discussions.filter(
        (d) => d.author?.login?.toLowerCase() === targetLogin.toLowerCase()
      );
    }
  } catch (err: any) {
    console.error(`Error fetching profile for ${targetLogin}:`, err);
  }

  // Fallback profile if GitHub API user search fails
  if (!userProfile) {
    const isSelf =
      session?.user &&
      ((session.user as any).login?.toLowerCase() === targetLogin.toLowerCase() ||
        session.user.name?.toLowerCase() === targetLogin.toLowerCase());

    userProfile = {
      id: targetLogin,
      login: targetLogin,
      name: isSelf ? session.user.name || targetLogin : targetLogin,
      avatarUrl: isSelf
        ? session.user.image || `https://github.com/${targetLogin}.png`
        : `https://github.com/${targetLogin}.png`,
      bio: isSelf ? (session.user as any).bio || "CSCPDUAM Department Member" : undefined,
      followers: { totalCount: 0 },
      following: { totalCount: 0 },
      repositories: { nodes: [] },
    };
  }

  const isCurrentUser =
    !!session?.user &&
    ((session.user as any).login?.toLowerCase() === targetLogin.toLowerCase() ||
      session.user.name?.toLowerCase() === targetLogin.toLowerCase());

  // Role detection (Can be expanded with department faculty lists)
  let roleBadge: "Student" | "Faculty" | "Maintainer" | "Contributor" = "Student";
  if (
    targetLogin.toLowerCase().includes("faculty") ||
    targetLogin.toLowerCase().includes("prof") ||
    targetLogin.toLowerCase().includes("doc")
  ) {
    roleBadge = "Faculty";
  } else if (
    targetLogin.toLowerCase().includes("admin") ||
    targetLogin.toLowerCase().includes("maintainer") ||
    targetLogin.toLowerCase() === "cscpduam"
  ) {
    roleBadge = "Maintainer";
  } else if (userDiscussions.length >= 3) {
    roleBadge = "Contributor";
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <Link
          href="/discussions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Discussions</span>
        </Link>

        <span className="text-xs text-muted-foreground font-mono">
          Community Profile: @{targetLogin}
        </span>
      </div>

      <main id="main-content">
        <ProfileView
          userProfile={userProfile}
          userDiscussions={userDiscussions}
          isCurrentUser={isCurrentUser}
          roleBadge={roleBadge}
        />
      </main>
    </div>
  );
}
