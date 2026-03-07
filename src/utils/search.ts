import type { VaultFile } from '../types'

export interface SearchResult {
  path: string
  title: string
  excerpt: string
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildExcerpt(body: string, terms: string[]): string {
  const bodyLower = body.toLowerCase()

  // Find the earliest position where any term appears
  let anchor = -1
  for (const term of terms) {
    const idx = bodyLower.indexOf(term)
    if (idx !== -1 && (anchor === -1 || idx < anchor)) anchor = idx
  }
  if (anchor === -1) return ''

  const start = Math.max(0, anchor - 60)
  const end = Math.min(body.length, anchor + 120)
  const slice = body.slice(start, end).replace(/\n+/g, ' ')

  // Highlight every term occurrence within the slice
  const pattern = new RegExp(
    terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
    'gi',
  )
  let out = ''
  let cursor = 0
  for (const m of slice.matchAll(pattern)) {
    out += escapeHtml(slice.slice(cursor, m.index))
    out += '<mark>' + escapeHtml(m[0]) + '</mark>'
    cursor = m.index! + m[0].length
  }
  out += escapeHtml(slice.slice(cursor))

  return (start > 0 ? '…' : '') + out + (end < body.length ? '…' : '')
}

export function searchFiles(files: Record<string, VaultFile>, query: string): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  // Prefix "tag:" filters by tag instead of full-text
  const tagFilter = q.startsWith('tag:') ? q.slice(4).trim() : null
  const results: (SearchResult & { score: number })[] = []

  const terms = [q]

  for (const [relPath, file] of Object.entries(files)) {
    if (results.length >= 200) break
    const title = file.meta.title ?? relPath.split('/').at(-1)!.replace(/\.md$/, '')

    if (tagFilter !== null) {
      if (file.meta.tags.some((t) => t.toLowerCase().includes(tagFilter)))
        results.push({ path: relPath, title, excerpt: '', score: 0 })
      continue
    }

    const titleLower = title.toLowerCase()
    const bodyLower = file.body.toLowerCase()
    const titleMatch = titleLower.includes(q)
    const bodyMatch = bodyLower.includes(q)

    if (titleMatch || bodyMatch) {
      // Score: exact title > title starts with > title contains > body only
      let score = 0
      if (titleLower === q) score = 3
      else if (titleLower.startsWith(q)) score = 2
      else if (titleMatch) score = 1
      results.push({ path: relPath, title, excerpt: buildExcerpt(file.body, terms), score })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results
}
