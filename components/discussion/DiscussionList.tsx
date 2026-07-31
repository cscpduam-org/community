import * as React from "react";
import { MessageSquarePlus } from "lucide-react";
import { DiscussionCard } from "@/components/discussion/DiscussionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { DiscussionListSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Discussion } from "@/types/github";

export interface DiscussionListProps {
  discussions?: Discussion[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onNewDiscussion?: () => void;
  newDiscussionHref?: string;
  className?: string;
}

export function DiscussionList({
  discussions = [],
  isLoading = false,
  emptyTitle = "No discussions found",
  emptyDescription = "Be the first to start a conversation or ask a question in this community!",
  onNewDiscussion,
  newDiscussionHref = "/discussions/new",
  className,
}: DiscussionListProps) {
  if (isLoading) {
    return <DiscussionListSkeleton count={5} className={className} />;
  }

  if (!discussions || discussions.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={MessageSquarePlus}
        actionLabel={newDiscussionHref || onNewDiscussion ? "Start Discussion" : undefined}
        actionHref={newDiscussionHref}
        onAction={onNewDiscussion}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <ul className="space-y-4 list-none p-0 m-0" role="list">
        {discussions.map((discussion) => (
          <li key={discussion.id || discussion.number}>
            <DiscussionCard discussion={discussion} />
          </li>
        ))}
      </ul>
    </div>
  );
}
