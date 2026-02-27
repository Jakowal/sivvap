import type { AliasMap } from './types'

const WIKILINK_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function encodeFilePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

export function preprocessWikiLinks(markdown: string, aliasMap: AliasMap): string {
  return markdown.replace(WIKILINK_RE, (_match, target: string, display: string | undefined) => {
    const displayText = (display ?? target).trim()
    const t = target.trim()
    const resolved = aliasMap[t] ?? aliasMap[t.toLowerCase()] ?? null
    if (resolved === null) {
      return `<span class="wiki-link broken" title="Note not found: ${escapeHtml(t)}">${escapeHtml(displayText)}</span>`
    }
    return `<a class="wiki-link" href="#/${encodeFilePath(resolved)}">${escapeHtml(displayText)}</a>`
  })
}
