import type { VaultFile, AliasMap, TreeNode } from '../types'
import { parseFrontmatter } from './frontmatter'
import { buildTreeFromPaths } from './tree'
import { toUrlPath } from './urlpath'

export function processVaultFiles(
  rawFiles: Record<string, string>,
  dates?: Record<string, string | null>,
): {
  tree: TreeNode[]
  aliasMap: AliasMap
  files: Record<string, VaultFile>
  urlMap: Record<string, string>
} {
  const keys = Object.keys(rawFiles)
  if (keys.length === 0) return { tree: [], aliasMap: {}, files: {}, urlMap: {} }

  // When VAULT_PATH is set, use it as the prefix; otherwise auto-detect
  // from the first 3 path components (e.g. /Vault/<vault-name>/)
  const vaultPrefix = typeof __VAULT_PATH__ === 'string' && __VAULT_PATH__
    ? `/Vault/${__VAULT_PATH__}/`
    : keys[0].split('/').slice(0, 3).join('/') + '/'

  const files: Record<string, VaultFile> = {}
  const aliasMap: AliasMap = {}
  const urlMap: Record<string, string> = {}

  for (const [absPath, raw] of Object.entries(rawFiles)) {
    if (!absPath.startsWith(vaultPrefix)) continue
    const relPath = absPath.slice(vaultPrefix.length)
    // Skip files inside hidden directories (e.g. .obsidian)
    if (relPath.split('/').some((p) => p.startsWith('.'))) continue

    const { meta, body } = parseFrontmatter(raw)
    if (!meta.publish) continue
    files[relPath] = { path: relPath, meta, body, lastUpdated: dates?.[absPath] ?? null }
    const urlPath = toUrlPath(relPath)
    urlMap[urlPath] = relPath
    // Vue Router decodes URL params, so also register the decoded form
    const decoded = decodeURIComponent(urlPath)
    if (decoded !== urlPath) urlMap[decoded] = relPath

    // Register the filename stem and any declared aliases for wikilink resolution,
    // storing both original and lowercase forms for case-insensitive lookup
    const stem = relPath.split('/').at(-1)!.replace(/\.md$/, '')
    aliasMap[stem] = relPath
    aliasMap[stem.toLowerCase()] = relPath
    for (const alias of meta.aliases) {
      aliasMap[alias] = relPath
      aliasMap[alias.toLowerCase()] = relPath
    }
  }

  return { tree: buildTreeFromPaths(Object.keys(files)), aliasMap, files, urlMap }
}
