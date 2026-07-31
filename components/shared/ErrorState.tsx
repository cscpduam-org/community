import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string | number;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while fetching data. Please try again later.",
  code,
  onRetry,
  isRetrying = false,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex flex-col items-center justify-center rounded-[16px] border border-destructive/20 bg-destructive/5 p-8 text-center sm:p-12 transition-colors",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>

      <h3 className="text-lg font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground max-w-md mb-2 leading-relaxed">
        {message}
      </p>

      {code && (
        <span className="inline-block rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground mb-6">
          Code: {code}
        </span>
      )}

      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          isLoading={isRetrying}
          className={cn("gap-2", !code && "mt-4")}
        >
          {!isRetrying && <RotateCcw className="h-4 w-4" />}
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
