"use client";

import * as React from "react";
import {
  MessageSquare,
  Pin,
  Lock,
  CheckCircle2,
  Smile,
  ExternalLink,
  Share2,
  Check,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { CommentCard } from "@/components/discussion/CommentCard";
import { CommentEditor } from "@/components/discussion/CommentEditor";
import { formatRelativeTime } from "@/lib/formatDate";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Discussion, Comment, ReactionContent, ReactionGroup } from "@/types/github";

const REACTION_EMOJIS: Record<ReactionContent, string> = {
  THUMBS_UP: "👍",
  THUMBS_DOWN: "👎",
  LAUGH: "😄",
  HOORAY: "🎉",
  CONFUSED: "😕",
  HEART: "❤️",
  ROCKET: "🚀",
  EYES: "👀",
};

export interface DiscussionDetailViewProps {
  discussion: Discussion;
  onCommentAdded?: (newComment: Comment) => void;
  onReactionToggled?: (content: ReactionContent) => void;
  className?: string;
}

export function DiscussionDetailView({
  discussion,
  onCommentAdded,
  onReactionToggled,
  className,
}: DiscussionDetailViewProps) {
  const { toast } = useToast();
  const [comments, setComments] = React.useState<Comment[]>(
    discussion.comments?.nodes || []
  );
  const [reactionGroups, setReactionGroups] = React.useState<ReactionGroup[]>(
    discussion.reactionGroups || []
  );
  const [showReactionPicker, setShowReactionPicker] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [replyTarget, setReplyTarget] = React.useState<{
    id: string;
    username: string;
  } | null>(null);

  const { data: session } = useSession();
  const [isClosed, setIsClosed] = React.useState(Boolean(discussion.closed));
  const [isTogglingClose, setIsTogglingClose] = React.useState(false);

  const currentUserLogin = (session?.user as any)?.login || (session?.user as any)?.username || session?.user?.name;
  const isAuthor = Boolean(
    currentUserLogin &&
    discussion.author?.login &&
    currentUserLogin.toLowerCase() === discussion.author.login.toLowerCase()
  );
  const canClose = Boolean(discussion.viewerCanClose || isAuthor);

  const handleCloseToggle = async () => {
    try {
      setIsTogglingClose(true);
      const action = isClosed ? "reopen" : "close";
      const res = await fetch("/api/github/discussions/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discussionId: discussion.id,
          action,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update discussion status");
      }

      setIsClosed(!isClosed);
      toast({
        title: isClosed ? "Discussion reopened" : "Discussion closed",
        description: isClosed
          ? "This discussion has been reopened."
          : "This discussion has been closed.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update discussion status",
        variant: "destructive",
      });
    } finally {
      setIsTogglingClose(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast({
        title: "Link copied",
        description: "Discussion link copied to clipboard.",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDiscussionReaction = async (content: ReactionContent) => {
    try {
      const existingGroup = reactionGroups.find((g) => g.content === content);
      const isRemoving = existingGroup?.viewerHasReacted;
      const action = isRemoving ? "remove" : "add";

      const res = await fetch("/api/github/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: discussion.id,
          content,
          action,
        }),
      });

      if (res.ok) {
        setReactionGroups((prev) => {
          const existing = prev.find((g) => g.content === content);
          if (existing) {
            return prev.map((g) =>
              g.content === content
                ? {
                    ...g,
                    viewerHasReacted: !g.viewerHasReacted,
                    users: {
                      totalCount: g.viewerHasReacted
                        ? Math.max(0, g.users.totalCount - 1)
                        : g.users.totalCount + 1,
                    },
                  }
                : g
            );
          }
          return [
            ...prev,
            {
              content,
              viewerHasReacted: true,
              users: { totalCount: 1 },
            },
          ];
        });

        if (onReactionToggled) onReactionToggled(content);
      }
    } catch (err) {
      console.error("Failed to react to discussion:", err);
    } finally {
      setShowReactionPicker(false);
    }
  };

  const handleCommentReact = async (commentId: string, content: ReactionContent) => {
    try {
      const targetComment = comments.find((c) => c.id === commentId);
      const existingGroup = targetComment?.reactionGroups?.find((g) => g.content === content);
      const isRemoving = existingGroup?.viewerHasReacted;
      const action = isRemoving ? "remove" : "add";

      const res = await fetch("/api/github/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: commentId,
          content,
          action,
        }),
      });

      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              const groups = c.reactionGroups || [];
              const updated = groups.map((g) =>
                g.content === content
                  ? {
                      ...g,
                      viewerHasReacted: !g.viewerHasReacted,
                      users: {
                        totalCount: g.viewerHasReacted
                          ? Math.max(0, g.users.totalCount - 1)
                          : g.users.totalCount + 1,
                      },
                    }
                  : g
              );
              if (!groups.some((g) => g.content === content)) {
                updated.push({
                  content,
                  viewerHasReacted: true,
                  users: { totalCount: 1 },
                });
              }
              return { ...c, reactionGroups: updated };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error("Failed to react to comment:", err);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/github/comments?id=${encodeURIComponent(commentId)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete comment");
      }

      setComments((prev) =>
        prev
          .filter((c) => c.id !== commentId)
          .map((c) => {
            if (c.replies?.nodes) {
              return {
                ...c,
                replies: {
                  ...c.replies,
                  nodes: c.replies.nodes.filter((r) => r.id !== commentId),
                },
              };
            }
            return c;
          })
      );

      toast({
        title: "Comment deleted",
        description: "The comment was successfully deleted.",
      });
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      toast({
        title: "Error deleting comment",
        description: err.message || "An error occurred while deleting the comment.",
        variant: "destructive",
      });
    }
  };

  const handleCommentSubmitSuccess = (createdResult: any) => {
    const isObject = typeof createdResult === "object" && createdResult !== null && createdResult.id;
    const newComment: Comment = isObject
      ? createdResult
      : {
          id: `temp-${Date.now()}`,
          body: typeof createdResult === "string" ? createdResult : createdResult.body || "",
          createdAt: new Date().toISOString(),
          author: (session?.user as any)?.login
            ? {
                login: (session?.user as any).login,
                avatarUrl: session?.user?.image || "",
                url: (session?.user as any).profileUrl || `https://github.com/${(session?.user as any).login}`,
              }
            : discussion.author,
          viewerCanDelete: true,
          reactionGroups: [],
        };

    setComments((prev) => [...prev, newComment]);
    setReplyTarget(null);
    if (onCommentAdded) onCommentAdded(newComment);
  };

  return (
    <div className={cn("space-y-8 w-full max-w-4xl mx-auto", className)}>
      {/* Main Discussion Post Card */}
      <Card className="p-6 sm:p-8 space-y-6 border border-border shadow-sm">
        {/* Discussion Category & Status Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {discussion.category && (
              <CategoryBadge
                category={discussion.category.name || discussion.category.slug}
                size="md"
              />
            )}
            {discussion.isPinned && (
              <Badge variant="warning" className="gap-1 px-2.5 py-1 font-semibold text-xs">
                <Pin className="h-3.5 w-3.5" />
                <span>Pinned</span>
              </Badge>
            )}
            {discussion.locked && (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1 font-semibold text-xs">
                <Lock className="h-3.5 w-3.5" />
                <span>Locked</span>
              </Badge>
            )}
            {isClosed && (
              <Badge variant="destructive" className="gap-1 px-2.5 py-1 font-semibold text-xs">
                <XCircle className="h-3.5 w-3.5" />
                <span>Closed</span>
              </Badge>
            )}
            {discussion.isAnswered && (
              <Badge variant="success" className="gap-1 px-2.5 py-1 font-semibold text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Answered</span>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseToggle}
                isLoading={isTogglingClose}
                className="h-8 gap-1.5 text-xs border-border hover:bg-muted"
              >
                {isClosed ? (
                  <RotateCcw className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                )}
                <span>{isClosed ? "Reopen Discussion" : "Close Discussion"}</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 gap-1.5 text-xs"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "Copied" : "Share"}</span>
            </Button>
            {discussion.url && (
              <a
                href={discussion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
                title="View on GitHub"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Discussion Title */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug">
          {discussion.title}
        </h1>

        {/* Author Header */}
        <div className="flex items-center justify-between pt-2 border-b border-border pb-4">
          <UserAvatar
            name={discussion.author?.name || discussion.author?.login}
            image={discussion.author?.avatarUrl}
            username={discussion.author?.login}
            size="md"
            showName
            subtext={`Posted ${formatRelativeTime(discussion.createdAt)}`}
          />

          <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            #{discussion.number}
          </span>
        </div>

        {/* Discussion Body Content */}
        <div className="text-base leading-relaxed text-foreground py-2">
          <MarkdownRenderer content={discussion.body} />
        </div>

        {/* Discussion Reaction Bar */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {reactionGroups.map((group) => {
              const count = group.users?.totalCount || 0;
              if (count === 0 && !group.viewerHasReacted) return null;
              return (
                <button
                  key={group.content}
                  type="button"
                  onClick={() => handleDiscussionReaction(group.content)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    group.viewerHasReacted
                      ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                      : "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{REACTION_EMOJIS[group.content]}</span>
                  <span>{count}</span>
                </button>
              );
            })}

            {/* Reaction Picker Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="h-8 rounded-full gap-1.5 text-xs"
              >
                <Smile className="h-4 w-4" />
                <span>React</span>
              </Button>

              {showReactionPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-20 flex items-center gap-1 p-1.5 bg-popover border border-border rounded-full shadow-lg animate-in fade-in-50 zoom-in-95">
                  {(Object.keys(REACTION_EMOJIS) as ReactionContent[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleDiscussionReaction(key)}
                      className="p-1.5 hover:bg-accent rounded-full text-lg transition-transform hover:scale-125 focus:outline-none"
                      title={key.toLowerCase()}
                    >
                      {REACTION_EMOJIS[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Answered Banner if Answer is available */}
      {discussion.answer && (
        <Card className="p-6 border-emerald-500/30 bg-emerald-500/5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>Marked Answer</span>
          </div>
          <div className="text-sm">
            <MarkdownRenderer content={discussion.answer.body} />
          </div>
          <div className="text-xs text-muted-foreground">
            Answered by <span className="font-semibold text-foreground">@{discussion.answer.author?.login}</span>
          </div>
        </Card>
      )}

      {/* Discussion Comments List Section */}
      <section className="space-y-4" aria-label="Discussion Comments">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Comments</span>
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          </h2>
        </div>

        {comments.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card/40 text-muted-foreground text-sm">
            No comments yet. Start the conversation by submitting a comment below!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                discussionId={discussion.id}
                onReact={handleCommentReact}
                onDelete={handleCommentDelete}
                onReply={(id, username) => {
                  setReplyTarget({ id, username });
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Comment Editor Section */}
      <section className="space-y-3" aria-label="Add Comment">
        <h3 className="text-lg font-semibold text-foreground">
          {replyTarget ? `Replying to @${replyTarget.username}` : "Add to Discussion"}
        </h3>
        {discussion.locked ? (
          <div className="p-4 rounded-xl bg-muted text-muted-foreground text-sm flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>This discussion is locked. New comments cannot be posted.</span>
          </div>
        ) : (
          <CommentEditor
            discussionId={discussion.id}
            replyToId={replyTarget?.id}
            replyToUser={replyTarget?.username}
            onCancel={replyTarget ? () => setReplyTarget(null) : undefined}
            onSubmit={async (bodyText) => {
              handleCommentSubmitSuccess(bodyText);
            }}
          />
        )}
      </section>
    </div>
  );
}
