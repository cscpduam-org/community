"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Reply, LogIn, CheckCircle2 } from "lucide-react";
import { Comment } from "@/types/github";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { formatRelativeTime } from "@/lib/formatDate";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface CommentSectionProps {
  discussionId: string;
  comments: Comment[];
  answer?: Comment | null;
  locked?: boolean;
}

export function CommentSection({
  discussionId,
  comments: initialComments,
  answer,
  locked = false,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = React.useState<Comment[]>(initialComments || []);
  const [commentText, setCommentText] = React.useState("");
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleAddComment = async (e: React.FormEvent, replyToId?: string) => {
    e.preventDefault();
    const text = replyToId ? replyText : commentText;
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/github/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discussionId,
          body: text.trim(),
          replyToId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post comment");
      }

      const newComment: Comment = await res.json();

      if (replyToId) {
        // Append to parent comment's replies
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyToId) {
              const existingReplies = c.replies?.nodes || [];
              return {
                ...c,
                replies: {
                  totalCount: (c.replies?.totalCount || 0) + 1,
                  nodes: [...existingReplies, newComment],
                },
              };
            }
            return c;
          })
        );
        setReplyingToId(null);
        setReplyText("");
      } else {
        setComments((prev) => [...prev, newComment]);
        setCommentText("");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 pt-6 border-t border-border" aria-label="Discussion Comments">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span>Responses ({comments.length})</span>
        </h2>
      </div>

      {/* Answer Highlight if present */}
      {answer && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>Marked Answer</span>
          </div>
          <div className="flex items-center gap-3">
            <UserAvatar
              name={answer.author?.login}
              image={answer.author?.avatarUrl}
              username={answer.author?.login}
              size="sm"
            />
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{answer.author?.login}</span> •{" "}
              {formatRelativeTime(answer.createdAt)}
            </div>
          </div>
          <div className="pt-2">
            <MarkdownRenderer content={answer.body} />
          </div>
        </div>
      )}

      {/* Comment Form */}
      {locked ? (
        <div className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
          This discussion has been locked by a moderator.
        </div>
      ) : session ? (
        <form onSubmit={(e) => handleAddComment(e)} className="space-y-3">
          <div className="flex items-start gap-3">
            <UserAvatar
              name={session.user?.name || session.user?.username}
              image={session.user?.image || undefined}
              username={session.user?.username || undefined}
              size="md"
            />
            <div className="flex-1 space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a response... (Markdown supported)"
                rows={3}
                aria-label="Write a comment"
                className="w-full rounded-xl border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y min-h-[90px]"
              />
              {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  isLoading={isSubmitting}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Post Response
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-border bg-muted/40 p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Sign in with GitHub to participate in this discussion and reply.
          </p>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/api/auth/signin">
              <LogIn className="h-4 w-4" />
              Sign in with GitHub
            </Link>
          </Button>
        </div>
      )}

      {/* List of Comments */}
      <div className="space-y-4 pt-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={comment.author?.login}
                  image={comment.author?.avatarUrl}
                  username={comment.author?.login}
                  size="sm"
                />
                <div>
                  <span className="font-semibold text-sm text-foreground block">
                    {comment.author?.login || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
              </div>
              {session && !locked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReplyingToId(replyingToId === comment.id ? null : comment.id)
                  }
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Reply
                </Button>
              )}
            </div>

            {/* Body */}
            <div className="pt-1">
              <MarkdownRenderer content={comment.body} />
            </div>

            {/* Nested Reply Input */}
            {replyingToId === comment.id && (
              <form
                onSubmit={(e) => handleAddComment(e, comment.id)}
                className="mt-3 pl-4 border-l-2 border-primary/40 space-y-2"
              >
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to @${comment.author?.login}...`}
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingToId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyText.trim() || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Reply
                  </Button>
                </div>
              </form>
            )}

            {/* Render Nested Replies */}
            {comment.replies?.nodes && comment.replies.nodes.length > 0 && (
              <div className="mt-4 pl-4 sm:pl-6 border-l-2 border-border space-y-3">
                {comment.replies.nodes.map((reply) => (
                  <div key={reply.id} className="pt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={reply.author?.login}
                        image={reply.author?.avatarUrl}
                        username={reply.author?.login}
                        size="sm"
                      />
                      <span className="font-semibold text-xs text-foreground">
                        {reply.author?.login}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(reply.createdAt)}
                      </span>
                    </div>
                    <MarkdownRenderer content={reply.body} className="text-xs" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
