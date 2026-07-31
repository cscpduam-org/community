import * as React from "react";
import {
  Megaphone,
  HelpCircle,
  MessageSquare,
  Lightbulb,
  Code2,
  BookOpen,
  Calendar,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn, sanitizeCategoryName } from "@/lib/utils";

export interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  announcements: {
    label: "Announcements",
    icon: Megaphone,
    colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 hover:bg-amber-500/20",
  },
  "q&a": {
    label: "Q&A",
    icon: HelpCircle,
    colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 hover:bg-blue-500/20",
  },
  qa: {
    label: "Q&A",
    icon: HelpCircle,
    colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 hover:bg-blue-500/20",
  },
  general: {
    label: "General",
    icon: MessageSquare,
    colorClass: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400 hover:bg-slate-500/20",
  },
  ideas: {
    label: "Ideas",
    icon: Lightbulb,
    colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 hover:bg-purple-500/20",
  },
  projects: {
    label: "Projects",
    icon: Code2,
    colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/20",
  },
  resources: {
    label: "Resources",
    icon: BookOpen,
    colorClass: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400 hover:bg-cyan-500/20",
  },
  events: {
    label: "Events",
    icon: Calendar,
    colorClass: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400 hover:bg-rose-500/20",
  },
  showcase: {
    label: "Showcase",
    icon: Sparkles,
    colorClass: "bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400 hover:bg-pink-500/20",
  },
};

const DEFAULT_CATEGORY: CategoryConfig = {
  label: "General",
  icon: Tag,
  colorClass: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
};

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  category: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  interactive?: boolean;
}

export function CategoryBadge({
  category,
  size = "md",
  showIcon = true,
  interactive = false,
  className,
  onClick,
  ...props
}: CategoryBadgeProps) {
  const cleanCategory = sanitizeCategoryName(category);
  const normalizedKey = cleanCategory.toLowerCase().trim();
  const config = CATEGORY_MAP[normalizedKey] || {
    ...DEFAULT_CATEGORY,
    label: cleanCategory,
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3 py-1.5 text-sm font-semibold gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <div
      role={interactive || onClick ? "button" : "status"}
      aria-label={`Category: ${config.label}`}
      tabIndex={interactive || onClick ? 0 : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-[999px] border transition-colors",
        sizeClasses[size],
        config.colorClass,
        (interactive || onClick) && "cursor-pointer active:scale-95",
        className
      )}
      {...props}
    >
      {showIcon && <IconComponent className={iconSizes[size]} aria-hidden="true" />}
      <span>{config.label}</span>
    </div>
  );
}
