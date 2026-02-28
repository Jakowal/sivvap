import { describe, it, expect } from 'vitest'
import { processVaultFiles } from './vault'

describe('processVaultFiles', () => {
  it('returns empty result for empty input', () => {
    expect(processVaultFiles({})).toEqual({ tree: [], aliasMap: {}, files: {}, urlMap: {} })
  })

  it('strips the vault prefix so keys are relative paths', () => {
    const { files } = processVaultFiles({ '/Vault/Wiki/note.md': '---\npublish: true\n---\n# Hello' })
    expect(Object.keys(files)).toContain('note.md')
    expect(Object.keys(files)).not.toContain('/Vault/Wiki/note.md')
  })

  it('excludes files without publish: true', () => {
    const raw = {
      '/Vault/Wiki/published.md': '---\npublish: true\n---\nbody',
      '/Vault/Wiki/draft.md': '---\npublish: false\n---\nbody',
      '/Vault/Wiki/no-frontmatter.md': 'just content',
    }
    const { files } = processVaultFiles(raw)
    expect(Object.keys(files)).toEqual(['published.md'])
  })

  it('skips files inside hidden directories', () => {
    const raw = {
      '/Vault/Wiki/.obsidian/config.md': '---\npublish: true\n---\n',
      '/Vault/Wiki/note.md': '---\npublish: true\n---\n# Note',
    }
    const { files } = processVaultFiles(raw)
    expect(Object.keys(files)).toEqual(['note.md'])
  })

  it('registers the filename stem in the alias map', () => {
    const { aliasMap } = processVaultFiles({ '/Vault/Wiki/My Note.md': '---\npublish: true\n---\n' })
    expect(aliasMap['My Note']).toBe('My Note.md')
  })

  it('registers a lowercase stem for case-insensitive lookup', () => {
    const { aliasMap } = processVaultFiles({ '/Vault/Wiki/My Note.md': '---\npublish: true\n---\n' })
    expect(aliasMap['my note']).toBe('My Note.md')
  })

  it('registers declared aliases in the alias map', () => {
    const raw = { '/Vault/Wiki/note.md': '---\npublish: true\naliases:\n  - shortname\n---\nbody' }
    const { aliasMap } = processVaultFiles(raw)
    expect(aliasMap['shortname']).toBe('note.md')
  })

  it('builds a tree reflecting the file structure', () => {
    const raw = { '/Vault/Wiki/folder/note.md': '---\npublish: true\n---\n' }
    const { tree } = processVaultFiles(raw)
    expect(tree[0].type).toBe('dir')
    expect(tree[0].name).toBe('folder')
  })
})
