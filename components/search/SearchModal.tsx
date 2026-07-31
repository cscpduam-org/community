"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Sparkles, MessageSquare, CornerRightDown, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Category, Discussion } from "@/types/github";
import { formatRelativeTime } from "@/lib/formatDate";
import { slugify } from "@/lib/slugify";
import { CategoryBadge } from "@/components/shared/CategoryBadge";

export function SearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Sync open-global-search event
  React.useEffect(() => {
    const handleOpenSearch = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-global-search", handleOpenSearch);
    return () => {
      window.removeEventListener("open-global-search", handleOpenSearch);
    };
  }, []);

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch categories once when modal is mounted/opened
  React.useEffect(() => {
    if (!isOpen) return;
    async function loadCategories() {
      try {
        const res = await fetch("/api/github/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
        }
      } catch (err) {
        console.error("Failed to load categories for search modal:", err);
      }
    }
    loadCategories();
  }, [isOpen]);

  // Debounced search trigger
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch discussions when query or category changes
  React.useEffect(() => {
    if (!isOpen || !debouncedQuery.trim()) {
      setDiscussions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function performSearch() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set("q", debouncedQuery.trim());
        if (selectedCategory) {
          params.set("categoryId", selectedCategory);
        }

        const res = await fetch(`/api/github/search?${params.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setDiscussions(data.discussions || []);
        }
      } catch (err) {
        console.error("Search modal error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    performSearch();
    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, selectedCategory, isOpen]);

  // Handle opening discussion and closing modal
  const handleItemClick = (disc: Discussion) => {
    setIsOpen(false);
    const slug = slugify(disc.title || "discussion");
    router.push(`/discussions/${slug}-${disc.number}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-border bg-card shadow-2xl rounded-2xl">
        <DialogHeader className="p-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Search className="h-4 w-4 text-primary" />
            <span>Search Community</span>
          </DialogTitle>
        </DialogHeader>

        {/* Input area */}
        <div className="relative flex items-center border-b border-border/40 px-4 py-3 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your search keyword (e.g. assignment, project)..."
            className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/75"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories filters */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 border-b border-border/40 scrollbar-none bg-muted/10">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
              Filter:
            </span>
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-accent"
                }`}
              >
                <span>{cat.emoji || "💬"}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Results / List area */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Searching discussions...</span>
            </div>
          )}

          {!isLoading && discussions.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Discussions ({discussions.length})
              </div>
              {discussions.map((disc) => (
                <button
                  key={disc.id}
                  onClick={() => handleItemClick(disc)}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-accent/80 transition-colors focus:outline-none focus:bg-accent group"
                >
                  <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between">
                      <span className="font-semibold text-sm text-foreground truncate block">
                        {disc.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatRelativeTime(disc.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {disc.category && (
                        <CategoryBadge category={disc.category.name} size="sm" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        by @{disc.author?.login}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && query.trim() && discussions.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm font-semibold text-foreground">No discussions found</p>
              <p className="text-xs text-muted-foreground">
                We couldn't find any results matching &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {!query.trim() && (
            <div className="text-center py-12 space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">Type to search</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Search through student posts, study resources, announcements, and project showcase threads instantly.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
