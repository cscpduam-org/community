"use client";

import * as React from "react";
import { Send, Eye, Edit3, Columns, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { MarkdownToolbar } from "@/components/markdown/MarkdownToolbar";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export interface CommentEditorProps {
  discussionId: string;
  replyToId?: string;
  replyToUser?: string;
  onSubmit?: (body: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  className?: string;
}

export function CommentEditor({
  discussionId,
  replyToId,
  replyToUser,
  onSubmit,
  placeholder = "Write a comment... (Markdown & .md files supported)",
  autoFocus = false,
  onCancel,
  className,
}: CommentEditorProps) {
  const [content, setContent] = React.useState(
    replyToUser ? `@${replyToUser} ` : ""
  );
  const [activeTab, setActiveTab] = React.useState<"write" | "split" | "preview">("write");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { toast } = useToast();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Handle Drag & Drop of .md files
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (
      file.name.endsWith(".md") ||
      file.name.endsWith(".markdown") ||
      file.name.endsWith(".txt") ||
      file.type.includes("text") ||
      file.type.includes("markdown")
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
          toast({
            title: "File Loaded",
            description: `Successfully loaded content from ${file.name}`,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setError("Comment body cannot be empty.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/github/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discussionId,
          body: trimmed,
          replyToId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to post comment");
      }

      if (onSubmit) {
        await onSubmit(data.comment || data || trimmed);
      }

      setContent("");
      setActiveTab("write");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });

      if (onCancel) {
        onCancel();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      toast({
        title: "Failed to post comment",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-[16px] border border-border bg-card p-4 sm:p-5 shadow-sm transition-all focus-within:border-primary/50",
        className
      )}
    >
      {/* Tab Navigation: Write / Split / Preview & Reply Banner */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
              activeTab === "write"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors hidden sm:inline-flex",
              activeTab === "split"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
              activeTab === "preview"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {replyToUser && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            <span>Replying to @{replyToUser}</span>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="hover:text-foreground focus:outline-none"
                aria-label="Cancel reply"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Outer Input & Preview Container */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="rounded-xl border border-border bg-background overflow-hidden"
      >
        <MarkdownToolbar
          textareaRef={textareaRef}
          value={content}
          onChange={setContent}
        />

        {activeTab === "write" && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={5}
            disabled={isSubmitting}
            className="w-full resize-y border-0 bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-50 min-h-[140px] font-mono"
          />
        )}

        {activeTab === "split" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border min-h-[180px]">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write comment..."
              rows={5}
              disabled={isSubmitting}
              className="w-full resize-none border-0 bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-50 font-mono"
            />
            <div className="p-3 bg-muted/10 overflow-auto max-h-[300px]">
              <MarkdownRenderer content={content || "*Live preview will appear here...*"} />
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="min-h-[140px] p-4 bg-muted/20 text-sm overflow-auto max-h-[400px]">
            <MarkdownRenderer content={content || "*Nothing to preview*"} />
          </div>
        )}
      </div>

      {/* Submit / Cancel Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-3">
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Markdown & .md files supported
        </span>

        <div className="flex items-center gap-2 ml-auto">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            disabled={!content.trim() || isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            <span>Post Comment</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
