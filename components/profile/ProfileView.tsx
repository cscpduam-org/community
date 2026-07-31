"use client";

import * as React from "react";
import Link from "next/link";
import {
  Github,
  MapPin,
  Building,
  Link as LinkIcon,
  Users,
  Star,
  GitFork,
  BookOpen,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { DiscussionCard } from "@/components/discussion/DiscussionCard";
import { GitHubUserProfile, Discussion } from "@/types/github";

interface ProfileViewProps {
  userProfile: GitHubUserProfile;
  userDiscussions?: Discussion[];
  isCurrentUser?: boolean;
  roleBadge?: "Student" | "Faculty" | "Maintainer" | "Contributor";
}

export function ProfileView({
  userProfile,
  userDiscussions = [],
  isCurrentUser = false,
  roleBadge = "Student",
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = React.useState<"discussions" | "repositories">(
    "discussions"
  );

  // Role Badge Styling
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Faculty":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "Maintainer":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Contributor":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header Banner */}
      <div className="rounded-[24px] border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <UserAvatar
              user={{
                name: userProfile.name || userProfile.login,
                image: userProfile.avatarUrl,
                username: userProfile.login,
              }}
              size="xl"
              className="ring-4 ring-background shadow-md"
            />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {userProfile.name || userProfile.login}
                </h1>
                <span
                  className={`px-3 py-0.5 text-xs font-bold rounded-full border ${getRoleBadgeVariant(
                    roleBadge
                  )}`}
                >
                  {roleBadge}
                </span>
                {isCurrentUser && (
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full border border-border">
                    You
                  </span>
                )}
              </div>

              <p className="text-sm font-mono text-muted-foreground">@{userProfile.login}</p>

              {userProfile.bio && (
                <p className="text-sm text-foreground/90 max-w-xl leading-relaxed pt-1">
                  {userProfile.bio}
                </p>
              )}
            </div>
          </div>

          {/* External Profile CTA */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button asChild variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
              <a
                href={`https://github.com/${userProfile.login}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${userProfile.login} on GitHub`}
              >
                <Github className="h-4 w-4" />
                <span>GitHub Profile</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </Button>
          </div>
        </div>

        {/* User Metadata Grid */}
        <div className="pt-6 border-t border-border/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm text-muted-foreground">
          {userProfile.company && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{userProfile.company}</span>
            </div>
          )}

          {userProfile.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{userProfile.location}</span>
            </div>
          )}

          {userProfile.websiteUrl && (
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 shrink-0 text-primary" />
              <a
                href={
                  userProfile.websiteUrl.startsWith("http")
                    ? userProfile.websiteUrl
                    : `https://${userProfile.websiteUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-foreground transition-colors"
              >
                {userProfile.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-primary" />
            <span>
              <strong className="text-foreground">{userProfile.followers?.totalCount || 0}</strong>{" "}
              followers
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Activity Discussions vs Repositories */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("discussions")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "discussions"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Discussions ({userDiscussions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("repositories")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "repositories"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Repositories ({userProfile.repositories?.nodes?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Discussions Tab Content */}
        {activeTab === "discussions" && (
          <div className="space-y-4">
            {userDiscussions.length > 0 ? (
              userDiscussions.map((discussion) => (
                <DiscussionCard key={discussion.id} discussion={discussion} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-card/40">
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <h3 className="font-semibold text-foreground">No discussions posted yet</h3>
                <p className="text-xs text-muted-foreground">
                  {isCurrentUser
                    ? "Start a discussion with the department community to see it here."
                    : `@${userProfile.login} has not started any discussions yet.`}
                </p>
                {isCurrentUser && (
                  <Button asChild size="sm" className="mt-2 gap-2">
                    <Link href="/discussions/new">
                      <Sparkles className="h-4 w-4" />
                      <span>Start a Discussion</span>
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Repositories Tab Content */}
        {activeTab === "repositories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProfile.repositories?.nodes?.length ? (
              userProfile.repositories.nodes.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:bg-accent/50 hover:border-primary/40 transition-all shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{repo.name}</span>
                      </h3>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    {repo.primaryLanguage && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: repo.primaryLanguage.color || "#2563EB",
                          }}
                        />
                        {repo.primaryLanguage.name}
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        {repo.stargazerCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3.5 w-3.5" />
                        {repo.forkCount}
                      </span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-card/40">
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <h3 className="font-semibold text-foreground">No public repositories</h3>
                <p className="text-xs text-muted-foreground">
                  No public repositories found for @{userProfile.login}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
