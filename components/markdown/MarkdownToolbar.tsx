"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  List,
  CheckSquare,
  Table as TableIcon,
  FileCode,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MarkdownToolbar({
  textareaRef,
  value,
  onChange,
  className,
}: MarkdownToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const insertText = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultText;

    const newText =
      value.substring(0, start) + before + selected + after + value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verify it's a markdown or text file
    const isMarkdown =
      file.name.endsWith(".md") ||
      file.name.endsWith(".markdown") ||
      file.name.endsWith(".txt") ||
      file.type.includes("text") ||
      file.type.includes("markdown");

    if (!isMarkdown) {
      alert("Please select a valid Markdown (.md) or text (.txt) file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onChange(value ? `${value}\n\n${text}` : text);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const tools = [
    {
      label: "Bold",
      icon: Bold,
      action: () => insertText("**", "**", "bold text"),
    },
    {
      label: "Italic",
      icon: Italic,
      action: () => insertText("*", "*", "italic text"),
    },
    {
      label: "Heading",
      icon: Heading3,
      action: () => insertText("### ", "", "Heading 3"),
    },
    {
      label: "Quote",
      icon: Quote,
      action: () => insertText("> ", "", "Quote text"),
    },
    {
      label: "Code",
      icon: Code,
      action: () => insertText("```ts\n", "\n```", 'console.log("Hello");'),
    },
    {
      label: "Link",
      icon: LinkIcon,
      action: () => insertText("[", "](https://example.com)", "link title"),
    },
    {
      label: "Unordered List",
      icon: List,
      action: () => insertText("- ", "", "List item"),
    },
    {
      label: "Task List",
      icon: CheckSquare,
      action: () => insertText("- [ ] ", "", "Task item"),
    },
    {
      label: "Table",
      icon: TableIcon,
      action: () =>
        insertText(
          "| Header 1 | Header 2 |\n| --- | --- |\n| ",
          " | Item 2 |",
          "Item 1"
        ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-1 bg-muted/40 p-1.5 rounded-t-xl border-b border-border/80 text-muted-foreground",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              type="button"
              onClick={t.action}
              title={t.label}
              aria-label={t.label}
              className="p-1.5 rounded-md hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Attach .md File Action */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileUpload}
          className="hidden"
          id="md-file-upload"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach Markdown (.md) file"
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md border border-border/60 bg-background text-foreground hover:bg-accent transition-colors shadow-2xs"
        >
          <Paperclip className="h-3.5 w-3.5 text-primary" />
          <span>Attach .md File</span>
        </button>
      </div>
    </div>
  );
}
