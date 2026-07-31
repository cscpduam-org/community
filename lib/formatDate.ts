/**
 * Format a date into a human-readable string using Intl.DateTimeFormat.
 * Defaults to "MMM d, yyyy" format (e.g., "Jul 31, 2026").
 */
export function formatDate(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  if (!date) return "";

  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", options).format(d);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Format a date into a relative time string (e.g., "2 hours ago", "just now").
 */
export function formatRelativeTime(date: string | Date | number): string {
  if (!date) return "";

  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const time = d.getTime();
    if (isNaN(time)) return "";

    const now = Date.now();
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 0) {
      // Future date
      const absDiff = Math.abs(diffInSeconds);
      if (absDiff < 60) return "in a few seconds";
      if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)}m`;
      if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)}h`;
      return `in ${Math.floor(absDiff / 86400)}d`;
    }

    if (diffInSeconds < 30) {
      return "just now";
    }

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? "1 min ago" : `${diffInMinutes} mins ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? "1 hr ago" : `${diffInHours} hrs ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths === 1 ? "1 mo ago" : `${diffInMonths} mos ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return diffInYears === 1 ? "1 yr ago" : `${diffInYears} yrs ago`;
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "";
  }
}

/**
 * Alias for formatRelativeTime
 */
export const formatRelativeDate = formatRelativeTime;
