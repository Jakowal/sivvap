import type { TreeNode, NoteMeta, VaultFile, AliasMap } from '../types'

export interface SearchResult {
  path: string
  title: string
  excerpt: string
}

// ── HTML escaping ──────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Frontmatter ────────────────────────────────────────────────────────────

function extractList(block: string, key: string): string[] {
  const re = new RegExp(`^${key}:\\s*\\n((?:[ \\t]+-[ \\t]+.+\\n?)*)`, 'm')
  const m = block.match(re)
  if (!m) return []
  return [...m[1].matchAll(/^[ \t]+-[ \t]+(.+)$/gm)].map((x) => x[1].trim())
}

function parseFrontmatter(raw: string): { meta: NoteMeta; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: { tags: [], aliases: [] }, body: raw }
  return {
    meta: { tags: extractList(match[1], 'tags'), aliases: extractList(match[1], 'aliases') },
    body: match[2],
  }
}

// ── File tree ──────────────────────────────────────────────────────────────

function buildTreeFromPaths(relPaths: string[]): TreeNode[] {
  const children = new Map<string, TreeNode[]>()
  children.set('', [])

  for (const relPath of [...relPaths].sort()) {
    const parts = relPath.split('/')
    for (let i = 1; i < parts.length; i++) {
      const dirPath = parts.slice(0, i).join('/')
      if (!children.has(dirPath)) {
        const parentPath = parts.slice(0, i - 1).join('/')
        const dirNode: TreeNode = { name: parts[i - 1], path: dirPath, type: 'dir', children: [] }
        children.set(dirPath, dirNode.children!)
        children.get(parentPath)!.push(dirNode)
      }
    }
    const parentPath = parts.slice(0, -1).join('')
      ? parts.slice(0, -1).join('/')
      : ''
    children.get(parentPath)!.push({ name: parts.at(-1)!, path: relPath, type: 'file' })
  }

  function sortNodes(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    for (const node of nodes) if (node.children) sortNodes(node.children)
  }

  const root = children.get('')!
  sortNodes(root)
  return root
}

// ── Vault processing ───────────────────────────────────────────────────────

export function processVaultFiles(rawFiles: Record<string, string>): {
  tree: TreeNode[]
  aliasMap: AliasMap
  files: Record<string, VaultFile>
} {
  const keys = Object.keys(rawFiles)
  if (keys.length === 0) return { tree: [], aliasMap: {}, files: {} }

  // Derive vault prefix: /Vault/<subdir>/ from the first key
  const firstParts = keys[0].split('/')
  const vaultPrefix = firstParts.slice(0, 3).join('/') + '/'

  const files: Record<string, VaultFile> = {}
  const aliasMap: AliasMap = {}

  for (const [absPath, raw] of Object.entries(rawFiles)) {
    if (!absPath.startsWith(vaultPrefix)) continue
    const relPath = absPath.slice(vaultPrefix.length)
    if (relPath.split('/').some((p) => p.startsWith('.'))) continue

    const { meta, body } = parseFrontmatter(raw)
    files[relPath] = { path: relPath, meta, body }

    const stem = relPath.split('/').at(-1)!.replace(/\.md$/, '')
    aliasMap[stem] = relPath
    aliasMap[stem.toLowerCase()] = relPath
    for (const alias of meta.aliases) {
      aliasMap[alias] = relPath
      aliasMap[alias.toLowerCase()] = relPath
    }
  }

  return { tree: buildTreeFromPaths(Object.keys(files)), aliasMap, files }
}

// ── Search ─────────────────────────────────────────────────────────────────

export function searchFiles(
  files: Record<string, VaultFile>,
  query: string,
): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

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
