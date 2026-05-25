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
