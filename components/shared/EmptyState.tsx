import * as React from "react";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No items found",
  description = "There are no items to display at the moment.",
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
  actionHref,
  action,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const IconComponent = Icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="h-10 w-10 text-muted-foreground/70" />;
  };

  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border bg-card/50 p-8 text-center sm:p-12 transition-colors",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60 ring-8 ring-muted/20 mb-4">
        {renderIcon()}
      </div>

      <h3 className="text-lg font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action ? (
        action
      ) : actionHref && actionLabel ? (
        <Button asChild className="gap-2">
          <Link href={actionHref}>
            <Plus className="h-4 w-4" />
            <span>{actionLabel}</span>
          </Link>
        </Button>
      ) : actionLabel && onAction ? (
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>{actionLabel}</span>
        </Button>
      ) : null}
    </div>
  );
}
