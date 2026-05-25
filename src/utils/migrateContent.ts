/**
 * Convert plain or newline-separated text into HTML paragraph markup.
 *
 * Empty or falsy input yields a single empty paragraph. If `content` appears
 * to be HTML (starts with `<`), it is returned unchanged. Otherwise the text
 * is split on newlines, empty lines are dropped, and each remaining line is
 * wrapped in a `<p>...</p>` and concatenated.
 *
 * @param content - The input text to migrate; may already be HTML
 * @returns The migrated HTML string: the original `content` if it starts with `<`, a concatenation of `<p>...</p>` blocks for each non-empty line, or `<p></p>` when no paragraphs are produced
 */
export function migrateContent(content: string): string {
  if (!content) return '<p></p>';
  if (content.startsWith('<')) return content;
  return (
    content
      .split('\n')
      .filter(Boolean)
      .map((line) => `<p>${line}</p>`)
      .join('') || '<p></p>'
  );
}
