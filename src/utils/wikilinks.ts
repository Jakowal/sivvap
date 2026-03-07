import { marked } from 'marked'
import type { AliasMap, VaultFile } from '../types'
import { toUrlPath } from './urlpath'
import { stripComments } from './comments'

// Matches ![[embed]], [[target]] and [[target|display]] syntax
const WIKILINK_RE = /(!?)\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g

const MAX_EMBED_DEPTH = 3

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Extract the content under a specific heading from markdown.
 * Returns everything from the line after the heading until the next
 * heading of equal or higher level (fewer or equal #'s), or end of string.
 */
function extractSection(markdown: string, heading: string): string | null {
  const lines = markdown.split('\n')
  let capturing = false
  let headingLevel = 0
  const result: string[] = []

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      if (capturing) {
        // Stop if we hit a heading of equal or higher level
        if (headingMatch[1].length <= headingLevel) break
        result.push(line)
      } else if (headingMatch[2].trim().toLowerCase() === heading.toLowerCase()) {
        capturing = true
        headingLevel = headingMatch[1].length
      }
    } else if (capturing) {
      result.push(line)
    }
  }

  return capturing ? result.join('\n').trim() : null
}

export function preprocessWikiLinks(
  markdown: string,
  aliasMap: AliasMap,
  files: Record<string, VaultFile> = {},
  depth: number = 0,
): string {
  return markdown.replace(WIKILINK_RE, (_match, bang: string, target: string, display: string | undefined) => {
    const isEmbed = bang === '!'
    const t = target.trim()

    if (!isEmbed) {
      const displayText = (display ?? t).trim()
      const resolved = aliasMap[t] ?? aliasMap[t.toLowerCase()] ?? null
      if (resolved === null) {
        return `<span class="wiki-link broken" title="Note not found: ${escapeHtml(t)}">${escapeHtml(displayText)}</span>`
      }
      return `<a class="wiki-link" href="#/${toUrlPath(resolved)}">${escapeHtml(displayText)}</a>`
    }

    // Embed: ![[target]] or ![[target#heading]] or ![[target#heading|display]]
    const hashIdx = t.indexOf('#')
    const baseTarget = hashIdx >= 0 ? t.slice(0, hashIdx) : t
    const heading = hashIdx >= 0 ? t.slice(hashIdx + 1) : null

    const resolved = aliasMap[baseTarget] ?? aliasMap[baseTarget.toLowerCase()] ?? null
    if (resolved === null) {
      const displayText = (display ?? t).trim()
      return `<span class="wiki-link broken" title="Note not found: ${escapeHtml(baseTarget)}">${escapeHtml(displayText)}</span>`
    }

    const file = files[resolved]
    if (!file) {
      const displayText = (display ?? t).trim()
      return `<span class="wiki-link broken" title="Note not found: ${escapeHtml(baseTarget)}">${escapeHtml(displayText)}</span>`
    }

    let content = stripComments(file.body)

    if (heading) {
      const section = extractSection(content, heading)
      if (section !== null) {
        content = section
      }
      // If heading not found, fall back to full content
    }

    // Recursively process wikilinks in the embedded content (with depth limit)
    if (depth < MAX_EMBED_DEPTH) {
      content = preprocessWikiLinks(content, aliasMap, files, depth + 1)
    }

    const title = display ?? heading ?? file.meta.title ?? baseTarget
    const href = `#/${toUrlPath(resolved)}`
    const parsedContent = marked.parse(content) as string
    return `\n\n<blockquote class="embed"><a class="embed-title" href="${href}">${escapeHtml(title)}</a>\n${parsedContent}</blockquote>\n\n`
  })
}
