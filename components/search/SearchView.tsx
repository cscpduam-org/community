"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { DiscussionCard } from "@/components/discussion/DiscussionCard";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Category, Discussion } from "@/types/github";
import { cn } from "@/lib/utils";

interface SearchViewProps {
  initialQuery?: string;
  initialCategory?: string;
  categories?: Category[];
}

export function SearchView({
  initialQuery = "",
  initialCategory = "",
  categories = [],
}: SearchViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inputRef = React.useRef<HTMLInputElement>(null);

  const [query, setQuery] = React.useState(initialQuery || searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = React.useState(
    initialCategory || searchParams.get("category") || ""
  );
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debounced search query trigger
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Sync URL search parameters
  const updateUrl = React.useCallback(
    (newQuery: string, newCategory: string) => {
      const params = new URLSearchParams();
      if (newQuery.trim()) params.set("q", newQuery.trim());
      if (newCategory) params.set("category", newCategory);

      const queryString = params.toString();
      const newPath = queryString ? `/search?${queryString}` : "/search";
      router.replace(newPath, { scroll: false });
    },
    [router]
  );

  // Fetch search results whenever debouncedQuery or selectedCategory changes
  React.useEffect(() => {
    updateUrl(debouncedQuery, selectedCategory);

    if (!debouncedQuery.trim()) {
      setDiscussions([]);
      setTotalCount(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    async function executeSearch() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("q", debouncedQuery.trim());
        if (selectedCategory) {
          params.set("categoryId", selectedCategory);
        }

        const res = await fetch(`/api/github/search?${params.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch search results");
        }

        const data = await res.json();
        if (isMounted) {
          setDiscussions(data.discussions || []);
          setTotalCount(data.totalCount || data.discussions?.length || 0);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Search error:", err);
          setError(err.message || "An error occurred while searching.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, selectedCategory, updateUrl]);

  // Global keyboard shortcut to focus search input (Cmd+K or '/')
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search discussions by title, body, author, or keyword... (Press '/' to focus)"
          aria-label="Search community discussions"
          className="h-14 pl-12 pr-12 text-base rounded-2xl border-border bg-card shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
        />

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search query"
            className="absolute right-4 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <kbd className="absolute right-4 hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/60 border border-border rounded-lg shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Category Filter Bar */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5" />
            Filter Category:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory("")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-colors",
              !selectedCategory
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-accent"
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? "" : cat.id)}
                className={cn(
                  "shrink-0 transition-opacity rounded-full focus:outline-none focus:ring-2 focus:ring-primary",
                  isSelected ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"
                )}
              >
                <CategoryBadge category={cat.name} size="sm" />
              </button>
            );
          })}
        </div>
      )}

      {/* Search Header Stats */}
      {debouncedQuery.trim() && !isLoading && !error && (
        <div className="flex items-center justify-between border-b border-border/80 pb-3 text-sm text-muted-foreground">
          <span>
            Found <strong className="text-foreground">{totalCount}</strong>{" "}
            {totalCount === 1 ? "discussion" : "discussions"} matching &ldquo;
            <span className="text-foreground font-medium">{debouncedQuery.trim()}</span>
            &rdquo;
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Searching GitHub Discussions...</span>
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-card/60 border border-border/80 animate-pulse p-6 space-y-3"
            >
              <div className="h-4 bg-muted rounded-md w-3/4" />
              <div className="h-3 bg-muted/60 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Results List */}
      {!isLoading && !error && (
        <>
          {discussions.length > 0 ? (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <DiscussionCard key={discussion.id} discussion={discussion} />
              ))}
            </div>
          ) : debouncedQuery.trim() ? (
            <EmptyState
              title="No discussions found"
              description={`We couldn't find any discussions matching "${debouncedQuery}". Try refining your search query or selecting a different category.`}
              actionLabel="Create Discussion"
              onAction={() => router.push("/discussions/new")}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">
                Type to search CSCPDUAM Community
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Search through all student and faculty discussions, technical Q&A, project ideas, announcements, and resources.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
