import type { NoteMeta } from '../types'

// Extracts a YAML list field, e.g.:
//   tags:
//     - foo
//     - bar
function extractList(block: string, key: string): string[] {
  const re = new RegExp(`^${key}:\\s*\\n((?:[ \\t]+-[ \\t]+.+\\n?)*)`, 'm')
  const m = block.match(re)
  if (!m) return []
  return [...m[1].matchAll(/^[ \t]+-[ \t]+(.+)$/gm)].map((x) => x[1].trim())
}

export function parseFrontmatter(raw: string): { meta: NoteMeta; body: string } {
  // Match the --- ... --- block at the start of the file
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: { publish: false, tags: [], aliases: [], title: null }, body: raw }
  const block = match[1]
  const titleMatch = block.match(/^title:\s*(.*)$/m)
  const titleRaw = titleMatch ? titleMatch[1].trim().replace(/^(['"])(.*)\1$/, '$2') : null
  return {
    meta: {
      publish: /^publish:\s*(['"]?\s*true\s*['"]?)\s*$/m.test(block),
      tags: extractList(block, 'tags'),
      aliases: extractList(block, 'aliases'),
      title: titleRaw || null,
    },
    body: match[2],
  }
}
