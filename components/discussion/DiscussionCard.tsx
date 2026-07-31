import * as React from "react";
import Link from "next/link";
import { MessageSquare, ThumbsUp, Pin, Lock, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/formatDate";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { Discussion } from "@/types/github";

export interface DiscussionCardProps {
  discussion: Discussion;
  href?: string;
  className?: string;
}

export function DiscussionCard({ discussion, href, className }: DiscussionCardProps) {
  const targetHref =
    href || `/discussions/${slugify(discussion.title || "discussion")}-${discussion.number}`;

  // Calculate reaction count
  const reactionCount =
    discussion.reactions?.totalCount ??
    discussion.reactionGroups?.reduce((acc, g) => acc + (g.users?.totalCount || 0), 0) ??
    0;

  // Clean body preview snippet
  const bodySnippet = discussion.body
    ? discussion.body
        .replace(/[#*`_~>[\]()]/g, "") // Strip basic markdown formatting
        .trim()
        .slice(0, 160) + (discussion.body.length > 160 ? "..." : "")
    : "";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-border bg-card p-5 sm:p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md focus-within:ring-2 focus-within:ring-primary/20",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Header Metadata: Author info, Category badge & Status Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <UserAvatar
              name={discussion.author?.name || discussion.author?.login}
              image={discussion.author?.avatarUrl}
              username={discussion.author?.login}
              size="sm"
              showName
            />
            <span className="text-xs text-muted-foreground">•</span>
            <time
              dateTime={discussion.createdAt}
              className="text-xs text-muted-foreground whitespace-nowrap"
            >
              {formatRelativeTime(discussion.createdAt)}
            </time>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {discussion.isPinned && (
              <Badge variant="warning" className="gap-1 text-[11px] px-2 py-0.5 font-medium">
                <Pin className="h-3 w-3" aria-hidden="true" />
                <span>Pinned</span>
              </Badge>
            )}
            {discussion.locked && (
              <Badge variant="secondary" className="gap-1 text-[11px] px-2 py-0.5 font-medium">
                <Lock className="h-3 w-3" aria-hidden="true" />
                <span>Locked</span>
              </Badge>
            )}
            {discussion.closed && (
              <Badge variant="destructive" className="gap-1 text-[11px] px-2 py-0.5 font-medium">
                <XCircle className="h-3 w-3" aria-hidden="true" />
                <span>Closed</span>
              </Badge>
            )}
            {discussion.isAnswered && (
              <Badge variant="success" className="gap-1 text-[11px] px-2 py-0.5 font-medium">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                <span>Answered</span>
              </Badge>
            )}
            {discussion.category && (
              <CategoryBadge
                category={discussion.category.name || discussion.category.slug}
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Title Link */}
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
            <Link
              href={targetHref}
              className="focus:outline-none focus:underline after:absolute after:inset-0"
            >
              {discussion.title}
            </Link>
          </h3>
          {bodySnippet && (
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {bodySnippet}
            </p>
          )}
        </div>

        {/* Footer Metrics: Replies & Reactions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              <span>{discussion.comments?.totalCount || 0} replies</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <ThumbsUp className="h-4 w-4" aria-hidden="true" />
              <span>{reactionCount} reactions</span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-muted-foreground/70">
            #{discussion.number}
          </span>
        </div>
      </div>
    </Card>
  );
}
