"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Check,
  Copy,
  Info,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  Flame,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Copy Code Button Component
 */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied code to clipboard" : "Copy code to clipboard"}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-border/80 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

/**
 * Code Block Renderer with Language Header & Copy Action
 */
function CodeBlock({
  language,
  value,
}: {
  language?: string;
  value: string;
}) {
  return (
    <div className="relative my-4 rounded-xl border border-border/80 bg-slate-950 dark:bg-[#0d1117] overflow-hidden group shadow-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 dark:bg-[#161b22] border-b border-border/60 text-xs font-mono text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-slate-300">
          {language || "code"}
        </span>
        <CopyButton code={value} />
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-slate-100 dark:text-[#c9d1d9] selection:bg-blue-500/30">
        <pre className="m-0 p-0 bg-transparent border-0 font-mono text-sm leading-relaxed whitespace-pre">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
}

/**
 * GitHub Alert Callout Parser Component
 * Parses > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION]
 */
function AlertCallout({
  type,
  children,
}: {
  type: "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";
  children: React.ReactNode;
}) {
  const configs = {
    NOTE: {
      icon: Info,
      title: "Note",
      borderClass: "border-l-blue-500 bg-blue-500/5 text-blue-900 dark:text-blue-200",
      iconClass: "text-blue-500",
    },
    TIP: {
      icon: Lightbulb,
      title: "Tip",
      borderClass: "border-l-emerald-500 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200",
      iconClass: "text-emerald-500",
    },
    IMPORTANT: {
      icon: Flame,
      title: "Important",
      borderClass: "border-l-purple-500 bg-purple-500/5 text-purple-900 dark:text-purple-200",
      iconClass: "text-purple-500",
    },
    WARNING: {
      icon: AlertTriangle,
      title: "Warning",
      borderClass: "border-l-amber-500 bg-amber-500/5 text-amber-900 dark:text-amber-200",
      iconClass: "text-amber-500",
    },
    CAUTION: {
      icon: AlertCircle,
      title: "Caution",
      borderClass: "border-l-rose-500 bg-rose-500/5 text-rose-900 dark:text-rose-200",
      iconClass: "text-rose-500",
    },
  };

  const config = configs[type] || configs.NOTE;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "my-4 p-4 rounded-r-xl border-l-4 shadow-xs space-y-2",
        config.borderClass
      )}
    >
      <div className="flex items-center gap-2 font-semibold text-sm">
        <Icon className={cn("h-4 w-4 shrink-0", config.iconClass)} />
        <span>{config.title}</span>
      </div>
      <div className="text-sm leading-relaxed prose-p:my-1">{children}</div>
    </div>
  );
}

/**
 * Main Markdown Renderer Component
 */
function MarkdownRendererComponent({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none break-words text-foreground",
        "text-sm sm:text-base leading-relaxed font-sans space-y-3.5",
        // Headings (GitHub style)
        "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground",
        "prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:border-b prose-h1:border-border prose-h1:pb-2.5 prose-h1:mt-8 prose-h1:mb-4",
        "prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-7 prose-h2:mb-3",
        "prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2.5",
        "prose-h4:text-base sm:prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2",
        "prose-h5:text-sm sm:prose-h5:text-base prose-h5:mt-4 prose-h5:mb-2",
        "prose-h6:text-xs sm:prose-h6:text-sm prose-h6:mt-4 prose-h6:mb-2 prose-h6:text-muted-foreground",
        // Paragraphs & Text
        "prose-p:my-3 prose-p:leading-relaxed",
        "prose-strong:font-bold prose-strong:text-foreground",
        "prose-em:italic",
        "prose-del:line-through prose-del:text-muted-foreground",
        // Links
        "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline focus-visible:prose-a:ring-2 focus-visible:prose-a:ring-primary focus-visible:prose-a:rounded",
        // Lists & Indentation
        "prose-ul:my-3.5 prose-ul:list-disc prose-ul:pl-6 sm:prose-ul:pl-8",
        "prose-ol:my-3.5 prose-ol:list-decimal prose-ol:pl-6 sm:prose-ol:pl-8",
        "prose-li:my-1.5 prose-li:leading-relaxed",
        // Inline Code
        "prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-muted/80 prose-code:border prose-code:border-border/60 prose-code:font-mono prose-code:text-xs sm:prose-code:text-sm prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
        // Horizontal Rule
        "prose-hr:my-8 prose-hr:border-border/80",
        // Blockquotes
        "prose-blockquote:my-4 prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Custom Paragraph with proper vertical margins
          p({ children }) {
            return <p className="my-3 leading-relaxed text-foreground">{children}</p>;
          },

          // Custom Lists with proper indent padding & spacing
          ul({ children }) {
            return (
              <ul className="my-3.5 space-y-1.5 list-disc pl-6 sm:pl-8 text-foreground">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="my-3.5 space-y-1.5 list-decimal pl-6 sm:pl-8 text-foreground">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="my-1 leading-relaxed text-foreground">{children}</li>;
          },

          // Fenced Code Blocks & Inline Code
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const isInline = !match && !String(children).includes("\n");
            const codeString = String(children).replace(/\n$/, "");

            if (isInline) {
              return (
                <code
                  className={cn(
                    "px-1.5 py-0.5 rounded-md bg-muted/80 border border-border/60 font-mono text-xs sm:text-sm text-foreground",
                    codeClassName
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : undefined}
                value={codeString}
              />
            );
          },

          // GitHub Alert Callouts Support in Blockquotes
          blockquote({ children }) {
            const rawText = React.Children.toArray(children)
              .map((child) => (typeof child === "string" ? child : ""))
              .join("")
              .trim();

            const alertMatch = rawText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
            if (alertMatch) {
              const alertType = alertMatch[1].toUpperCase() as
                | "NOTE"
                | "TIP"
                | "IMPORTANT"
                | "WARNING"
                | "CAUTION";

              return <AlertCallout type={alertType}>{children}</AlertCallout>;
            }

            return (
              <blockquote className="my-4 border-l-4 border-muted-foreground/30 pl-4 py-1 italic text-muted-foreground bg-muted/20 rounded-r-lg">
                {children}
              </blockquote>
            );
          },

          // Responsive GitHub Tables
          table({ children }) {
            return (
              <div className="my-6 w-full overflow-x-auto rounded-xl border border-border shadow-xs">
                <table className="w-full border-collapse text-left text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-muted/70 dark:bg-[#161b22] border-b border-border font-semibold text-foreground">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return (
              <tbody className="divide-y divide-border/60 bg-card">
                {children}
              </tbody>
            );
          },
          tr({ children }) {
            return (
              <tr className="hover:bg-muted/40 transition-colors">
                {children}
              </tr>
            );
          },
          th({ children }) {
            return <th className="p-3 font-semibold text-foreground">{children}</th>;
          },
          td({ children }) {
            return <td className="p-3 text-foreground/90">{children}</td>;
          },

          // Links
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1 text-primary font-medium no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded"
                {...props}
              >
                <span>{children}</span>
                {isExternal && <ExternalLink className="h-3 w-3 inline shrink-0 opacity-70" />}
              </a>
            );
          },

          // Responsive Images
          img({ src, alt, ...props }) {
            return (
              <span className="block my-4">
                <img
                  src={src}
                  alt={alt || "Discussion attachment"}
                  loading="lazy"
                  className="rounded-xl border border-border/80 shadow-sm max-h-[550px] w-auto max-w-full object-cover my-2"
                  {...props}
                />
              </span>
            );
          },

          // GitHub Task Lists Checkboxes
          input({ type, checked, ...props }) {
            if (type === "checkbox") {
              return (
                <span
                  className={cn(
                    "inline-flex items-center justify-center h-4 w-4 rounded border shrink-0 mr-2 align-middle transition-colors",
                    checked
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/40 bg-background"
                  )}
                >
                  {checked && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
              );
            }
            return <input type={type} checked={checked} {...props} />;
          },
        }}
      >
        {content || "*No content provided.*"}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Exported Memoized Component for smooth live typing performance
 */
export const MarkdownRenderer = React.memo(MarkdownRendererComponent);
