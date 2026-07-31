"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { CornerDownRight, Reply, Trash2, Smile, AlertTriangle } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { Comment, ReactionContent } from "@/types/github";

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

export interface CommentCardProps {
  comment: Comment;
  discussionId?: string;
  parentAuthor?: string;
  onReact?: (commentId: string, content: ReactionContent) => Promise<void> | void;
  onReply?: (commentId: string, authorLogin: string) => void;
  onDelete?: (commentId: string) => Promise<void> | void;
  isReply?: boolean;
  className?: string;
}

export function CommentCard({
  comment,
  parentAuthor,
  onReact,
  onReply,
  onDelete,
  isReply = false,
  className,
}: CommentCardProps) {
  const { data: session } = useSession();
  const [showPicker, setShowPicker] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  const currentUserLogin =
    (session?.user as any)?.login ||
    (session?.user as any)?.username ||
    session?.user?.name;

  const isAuthor = Boolean(
    currentUserLogin &&
      comment.author?.login &&
      currentUserLogin.toLowerCase() === comment.author.login.toLowerCase()
  );

  const canDelete = Boolean(comment.viewerCanDelete || isAuthor);

  const handleReactionClick = async (content: ReactionContent) => {
    if (onReact) {
      await onReact(comment.id, content);
      setShowPicker(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-[18px] border border-border bg-card p-4 sm:p-5 transition-all shadow-2xs",
        isReply && "bg-card/70 border-l-4 border-l-primary/40 ml-2 sm:ml-6",
        className
      )}
    >
      {/* Reply Parent Hierarchy Badge */}
      {isReply && (parentAuthor || (comment as any).replyToUser) && (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 border border-primary/20">
          <CornerDownRight className="h-3.5 w-3.5" />
          <span>Replying to @{parentAuthor || (comment as any).replyToUser}</span>
        </div>
      )}

      {/* Author & Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <UserAvatar
            name={comment.author?.name || comment.author?.login}
            image={comment.author?.avatarUrl}
            username={comment.author?.login}
            size={isReply ? "sm" : "md"}
            showName
          />
          <span className="text-xs text-muted-foreground">•</span>
          <time
            dateTime={comment.createdAt}
            className="text-xs text-muted-foreground whitespace-nowrap"
          >
            {formatRelativeTime(comment.createdAt)}
          </time>
        </div>

        {/* Delete Action Trigger & Confirmation */}
        {canDelete && onDelete && (
          <div className="flex items-center gap-1">
            {showConfirmDelete ? (
              <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/30 px-2.5 py-1 rounded-lg animate-in fade-in duration-150">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                <span className="text-xs font-semibold text-destructive">Delete?</span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  className="h-6 px-2 text-[11px] font-bold"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isDeleting}
                  className="h-6 px-2 text-[11px]"
                >
                  No
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDelete(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete comment"
                aria-label="Delete comment"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Comment Body */}
      <div className="text-sm text-foreground my-2">
        <MarkdownRenderer content={comment.body} />
      </div>

      {/* Footer: Reactions & Reply Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-border/40">
        {/* Reactions Section */}
        <div className="flex flex-wrap items-center gap-1.5 relative">
          {comment.reactionGroups?.map((group) => {
            const count = group.users?.totalCount || 0;
            if (count === 0 && !group.viewerHasReacted) return null;
            return (
              <button
                key={group.content}
                type="button"
                onClick={() => handleReactionClick(group.content)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  group.viewerHasReacted
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={`React with ${group.content.toLowerCase()}`}
              >
                <span>{REACTION_EMOJIS[group.content]}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}

          {/* Quick Add Reaction Picker */}
          {onReact && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPicker(!showPicker)}
                className="h-7 px-2 text-xs rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Add reaction"
              >
                <Smile className="h-3.5 w-3.5 mr-1" />
                <span>React</span>
              </Button>

              {showPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-20 flex items-center gap-1 p-1.5 bg-popover border border-border rounded-full shadow-lg animate-in fade-in-50 zoom-in-95">
                  {(Object.keys(REACTION_EMOJIS) as ReactionContent[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleReactionClick(key)}
                      className="p-1.5 hover:bg-accent rounded-full text-base transition-transform hover:scale-125 focus:outline-none"
                      title={key.toLowerCase()}
                    >
                      {REACTION_EMOJIS[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reply Action Button */}
        {onReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id, comment.author?.login || "")}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5 hover:bg-muted"
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Reply</span>
          </Button>
        )}
      </div>

      {/* Render Nested Reply Hierarchy Tree */}
      {comment.replies && comment.replies.nodes && comment.replies.nodes.length > 0 && (
        <div className="relative mt-4 pt-3 border-l-2 border-primary/30 pl-3 sm:pl-5 space-y-4">
          {comment.replies.nodes.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              parentAuthor={comment.author?.login}
              onReact={onReact}
              onDelete={onDelete}
              onReply={onReply}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
