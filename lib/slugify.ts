/**
 * Convert a string to a URL-friendly slug.
 * Example: "Hello World! This is a Q&A" -> "hello-world-this-is-a-qa"
 */
export function slugify(text: string): string {
  if (!text) return "";

  return text
    .toString()
    .normalize("NFD") // Decompose combined graphemes (accents)
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .trim()
    .replace(/&/g, "and") // Replace & with 'and'
    .replace(/[^a-z0-9\s-]/g, "") // Remove all non-alphanumeric chars except spaces & hyphens
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with a single hyphen
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}
