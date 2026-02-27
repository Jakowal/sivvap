import type { VaultFile } from '../types'

export interface SearchResult {
  path: string
  title: string
  excerpt: string
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function searchFiles(
  files: Record<string, VaultFile>,
  query: string,
): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  // Prefix "tag:" filters by tag instead of full-text
  const tagFilter = q.startsWith('tag:') ? q.slice(4).trim() : null
  const results: SearchResult[] = []

  for (const [relPath, file] of Object.entries(files)) {
    if (results.length >= 20) break
    const title = relPath.split('/').at(-1)!.replace(/\.md$/, '')

    if (tagFilter !== null) {
      if (file.meta.tags.some((t) => t.toLowerCase().includes(tagFilter)))
        results.push({ path: relPath, title, excerpt: '' })
      continue
    }

    const bodyLower = file.body.toLowerCase()
    const titleMatch = title.toLowerCase().includes(q)
    const bodyIdx = bodyLower.indexOf(q)

    if (titleMatch || bodyIdx !== -1) {
      let excerpt = ''
      if (bodyIdx !== -1) {
        // Build a snippet with 60 chars of context around the match,
        // wrapping the matched term in <mark> for highlighting
        const start = Math.max(0, bodyIdx - 60)
        const end = Math.min(file.body.length, bodyIdx + q.length + 60)
        const slice = file.body.slice(start, end).replace(/\n+/g, ' ')
        const matchPos = bodyIdx - start
        excerpt =
          (start > 0 ? '…' : '') +
          escapeHtml(slice.slice(0, matchPos)) +
          '<mark>' + escapeHtml(slice.slice(matchPos, matchPos + q.length)) + '</mark>' +
          escapeHtml(slice.slice(matchPos + q.length)) +
          (end < file.body.length ? '…' : '')
      }
      results.push({ path: relPath, title, excerpt })
    }
  }

  return results
}
