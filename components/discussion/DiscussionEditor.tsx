"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Columns, Send, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { MarkdownToolbar } from "@/components/markdown/MarkdownToolbar";
import { useToast } from "@/components/ui/use-toast";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { Category, Discussion } from "@/types/github";

export interface DiscussionEditorProps {
  categories?: Category[];
  onSuccess?: (discussion: Discussion) => void;
  onCancel?: () => void;
  className?: string;
}

export function DiscussionEditor({
  categories: categoriesProp,
  onSuccess,
  onCancel,
  className,
}: DiscussionEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = React.useState<Category[]>(categoriesProp || []);
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(!categoriesProp || categoriesProp.length === 0);

  const [title, setTitle] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [body, setBody] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"write" | "split" | "preview">("write");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Fetch categories if not passed as prop
  React.useEffect(() => {
    if (categoriesProp && categoriesProp.length > 0) {
      setCategories(categoriesProp);
      if (!categoryId && categoriesProp[0]?.id) {
        setCategoryId(categoriesProp[0].id);
      }
      setIsLoadingCategories(false);
      return;
    }

    let isMounted = true;
    async function fetchCategories() {
      try {
        const response = await fetch("/api/github/categories");
        if (!response.ok) throw new Error("Failed to load categories");
        const data = await response.json();
        if (isMounted && Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setCategoryId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [categoriesProp, categoryId]);

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
          setBody((prev) => (prev ? `${prev}\n\n${text}` : text));
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

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      setError("Please enter a discussion title.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!trimmedBody) {
      setError("Discussion content cannot be empty.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/github/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          categoryId,
          body: trimmedBody,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create discussion");
      }

      const newDiscussion = data as Discussion;

      toast({
        title: "Discussion created!",
        description: "Your discussion has been published successfully.",
      });

      if (onSuccess) {
        onSuccess(newDiscussion);
      } else {
        const targetHref = `/discussions/${slugify(newDiscussion.title)}-${newDiscussion.number}`;
        router.push(targetHref);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      toast({
        title: "Failed to create discussion",
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
        "rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Create New Discussion</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ask a question, share an idea, or attach a .md file to start a discussion.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Title & Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Title Input */}
        <div className="md:col-span-2 space-y-2">
          <label htmlFor="discussion-title" className="text-sm font-semibold text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            id="discussion-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind? Keep it clear and concise."
            disabled={isSubmitting}
            required
            className="w-full h-11"
          />
        </div>

        {/* Category Dropdown */}
        <div className="space-y-2">
          <label htmlFor="discussion-category" className="text-sm font-semibold text-foreground">
            Category <span className="text-destructive">*</span>
          </label>
          <select
            id="discussion-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isSubmitting || isLoadingCategories}
            required
            className="w-full h-11 px-3 py-2 rounded-[12px] border border-input bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoadingCategories ? (
              <option value="">Loading categories...</option>
            ) : categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Body Content Editor & Preview Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label htmlFor="discussion-body" className="text-sm font-semibold text-foreground">
            Body Content <span className="text-destructive">*</span>
          </label>

          {/* Write / Split / Preview Tab Switcher */}
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
              <span>Live Preview</span>
            </button>
          </div>
        </div>

        {/* Editor Outer Container */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-xl border border-border bg-background overflow-hidden transition-colors focus-within:border-primary/50"
        >
          {/* Markdown Action Toolbar */}
          <MarkdownToolbar
            textareaRef={textareaRef}
            value={body}
            onChange={setBody}
          />

          {/* Content Panels */}
          {activeTab === "write" && (
            <textarea
              id="discussion-body"
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide context, code snippets, or details. Drag and drop .md files or click Attach .md File above..."
              rows={14}
              disabled={isSubmitting}
              required
              className="w-full resize-y border-0 bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-50 leading-relaxed font-mono min-h-[300px]"
            />
          )}

          {activeTab === "split" && (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border min-h-[350px]">
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write Markdown here..."
                rows={14}
                disabled={isSubmitting}
                className="w-full resize-none border-0 bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-50 leading-relaxed font-mono"
              />
              <div className="p-4 bg-muted/10 overflow-auto max-h-[500px]">
                <MarkdownRenderer content={body || "*Live preview will appear here...*"} />
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="min-h-[300px] p-6 bg-muted/20 text-sm overflow-auto max-h-[600px]">
              <MarkdownRenderer content={body || "*Nothing to preview yet. Start typing or attach a .md file!*"} />
            </div>
          )}
        </div>
      </div>

      {/* Form Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Markdown code blocks, tables, and .md files supported
        </span>

        <div className="flex items-center gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!title.trim() || !body.trim() || !categoryId || isSubmitting}
            className="gap-2 px-6"
          >
            <Send className="h-4 w-4" />
            <span>Publish Discussion</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
