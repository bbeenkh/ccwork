/**
 * Converts an HTML string into plain text by removing tags, decoding common HTML entities, collapsing consecutive whitespace, and trimming.
 *
 * @param html - The HTML string to convert
 * @returns The resulting plain-text string with HTML tags removed, `&nbsp;`, `&amp;`, `&lt;`, `&gt;`, and `&quot;` converted to their characters, consecutive whitespace collapsed to single spaces, and leading/trailing whitespace trimmed
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
