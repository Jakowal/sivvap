import { describe, it, expect } from 'vitest'
import { buildTreeFromPaths } from './tree'

describe('buildTreeFromPaths', () => {
  it('returns empty array for no paths', () => {
    expect(buildTreeFromPaths([])).toEqual([])
  })

  it('creates file nodes for flat paths', () => {
    const result = buildTreeFromPaths(['a.md', 'b.md'])
    expect(result).toHaveLength(2)
    expect(result.every((n) => n.type === 'file')).toBe(true)
  })

  it('creates a directory node for nested files', () => {
    const result = buildTreeFromPaths(['folder/note.md'])
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('dir')
    expect(result[0].name).toBe('folder')
    expect(result[0].children).toHaveLength(1)
    expect(result[0].children![0].name).toBe('note.md')
  })

  it('handles multiple levels of nesting', () => {
    const result = buildTreeFromPaths(['a/b/c.md'])
    expect(result[0].type).toBe('dir')
    expect(result[0].children![0].type).toBe('dir')
    expect(result[0].children![0].children![0].name).toBe('c.md')
  })

  it('sorts directories before files', () => {
    const result = buildTreeFromPaths(['z.md', 'a/b.md'])
    expect(result[0].type).toBe('dir')
    expect(result[1].type).toBe('file')
  })

  it('sorts alphabetically within each type', () => {
    const result = buildTreeFromPaths(['c.md', 'a.md', 'b.md'])
    expect(result.map((n) => n.name)).toEqual(['a.md', 'b.md', 'c.md'])
  })
})
