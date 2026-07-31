import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Remove raw GitHub shortcodes (e.g. ":mega: Announcements" -> "Announcements")
 */
export function sanitizeCategoryName(name?: string | null): string {
  if (!name) return "";
  return name.replace(/^:[a-z0-9_]+:\s*/i, "").trim();
}

/**
 * Map raw GitHub shortcodes to clean Unicode Emojis
 */
export function sanitizeCategoryEmoji(emoji?: string | null, name?: string): string {
  const shortcodeMap: Record<string, string> = {
    ":mega:": "📢",
    ":speech_balloon:": "💬",
    ":pray:": "❓",
    ":question:": "❓",
    ":bulb:": "💡",
    ":rocket:": "🚀",
    ":books:": "📚",
    ":calendar:": "📅",
    ":sparkles:": "✨",
    ":star:": "✨",
  };

  if (emoji && shortcodeMap[emoji.trim().toLowerCase()]) {
    return shortcodeMap[emoji.trim().toLowerCase()];
  }

  // If emoji is a shortcode like :something:
  if (emoji && /^:[a-z0-9_]+:$/i.test(emoji.trim())) {
    const key = emoji.trim().toLowerCase();
    if (key.includes("announc") || key.includes("mega")) return "📢";
    if (key.includes("chat") || key.includes("speech")) return "💬";
    if (key.includes("q") || key.includes("pray") || key.includes("question")) return "❓";
    if (key.includes("idea") || key.includes("bulb")) return "💡";
    if (key.includes("project") || key.includes("rocket")) return "🚀";
    if (key.includes("resource") || key.includes("book")) return "📚";
    if (key.includes("event") || key.includes("calendar")) return "📅";
    return "✨";
  }

  if (emoji && emoji.trim().length > 0) {
    return emoji.trim();
  }

  // Fallback based on category name
  const n = (name || "").toLowerCase();
  if (n.includes("announc")) return "📢";
  if (n.includes("general")) return "💬";
  if (n.includes("q&a") || n.includes("qa") || n.includes("question")) return "❓";
  if (n.includes("idea")) return "💡";
  if (n.includes("project")) return "🚀";
  if (n.includes("resource")) return "📚";
  if (n.includes("event")) return "📅";
  if (n.includes("showcase")) return "✨";

  return "💬";
}

export * from "./formatDate";
export * from "./slugify";
