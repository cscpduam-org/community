import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/70", className)}
      {...props}
    />
  );
}

export interface DiscussionCardSkeletonProps {
  className?: string;
}

function DiscussionCardSkeleton({ className }: DiscussionCardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-border bg-card p-6 shadow-sm space-y-4",
        className
      )}
    >
      {/* Header: User avatar, author info, category badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Title & snippet */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
      </div>

      {/* Footer metadata: Upvotes, Comments, Last updated */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export interface DiscussionListSkeletonProps {
  count?: number;
  className?: string;
}

function DiscussionListSkeleton({
  count = 4,
  className,
}: DiscussionListSkeletonProps) {
  return (
    <div className={cn("space-y-4 w-full", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <DiscussionCardSkeleton key={index} />
      ))}
    </div>
  );
}

export { Skeleton, DiscussionCardSkeleton, DiscussionListSkeleton };
