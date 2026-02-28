// Matches %% ... %% Obsidian-style comments, including multiline
const COMMENT_RE = /%%[\s\S]*?%%/g

export function stripComments(markdown: string): string {
  return markdown.replace(COMMENT_RE, '')
}
