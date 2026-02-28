import type { AliasMap } from '../types'
import { toUrlPath } from './urlpath'

// Matches [[target]] and [[target|display]] syntax
const WIKILINK_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function preprocessWikiLinks(markdown: string, aliasMap: AliasMap): string {
  return markdown.replace(WIKILINK_RE, (_match, target: string, display: string | undefined) => {
    const displayText = (display ?? target).trim()
    const t = target.trim()
    // Try exact match first, then fall back to lowercase for case-insensitive resolution
    const resolved = aliasMap[t] ?? aliasMap[t.toLowerCase()] ?? null
    if (resolved === null) {
      // Render unresolved links as an inert span so broken links are visible
      return `<span class="wiki-link broken" title="Note not found: ${escapeHtml(t)}">${escapeHtml(displayText)}</span>`
    }
    return `<a class="wiki-link" href="#/${toUrlPath(resolved)}">${escapeHtml(displayText)}</a>`
  })
}
