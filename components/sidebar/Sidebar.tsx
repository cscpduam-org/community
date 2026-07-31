"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  HelpCircle,
  FolderGit2,
  Megaphone,
  BookOpen,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  Compass,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryItem {
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { name: "General", slug: "general", icon: MessageSquare, color: "text-primary" },
  { name: "Q&A", slug: "qna", icon: HelpCircle, color: "text-primary" },
  { name: "Projects", slug: "projects", icon: FolderGit2, color: "text-primary" },
  { name: "Announcements", slug: "announcements", icon: Megaphone, color: "text-primary" },
  { name: "Resources", slug: "resources", icon: BookOpen, color: "text-primary" },
  { name: "Ideas", slug: "ideas", icon: Lightbulb, color: "text-primary" },
];

const DEPARTMENT_RESOURCES = [
  { name: "Setup Guide", href: "/setup", icon: Terminal, external: false },
  { name: "Official Website", href: "https://csc.pduamamjonga.in", icon: ExternalLink, external: true },
  { name: "GitHub Organization", href: "https://github.com/cscpduam-org", icon: ExternalLink, external: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Community Navigation Sidebar"
      className="hidden lg:block w-64 shrink-0 sticky top-24 self-start space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-6 scrollbar-thin"
    >
      {/* Category Navigation */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Compass className="h-3.5 w-3.5" />
          <span>Categories</span>
        </div>
        <nav aria-label="Categories" className="space-y-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const href = `/categories/${cat.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={cat.slug}
                href={href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "bg-accent text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", cat.color)} />
                  <span>{cat.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Department Resources */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span>Official Links</span>
        </div>
        <nav aria-label="Department Links" className="space-y-1">
          {DEPARTMENT_RESOURCES.map((res) => {
            const Icon = res.icon;
            const linkClass = "flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
            
            if (res.external) {
              return (
                <a
                  key={res.name}
                  href={res.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <span>{res.name}</span>
                  <Icon className="h-3.5 w-3.5 opacity-70" />
                </a>
              );
            }
            
            return (
              <Link
                key={res.name}
                href={res.href}
                className={linkClass}
              >
                <span>{res.name}</span>
                <Icon className="h-3.5 w-3.5 opacity-70" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Community Guidelines Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-primary">
          <ShieldCheck className="h-4 w-4" />
          <span>Community Guidelines</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Maintain respectful communication and code sharing standards in accordance with PDUAM values.
        </p>
        <Link
          href="/guidelines"
          className="inline-flex items-center text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          Read Guidelines &rarr;
        </Link>
      </div>
    </aside>
  );
}
