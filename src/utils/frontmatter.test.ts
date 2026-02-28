import { describe, it, expect } from 'vitest'
import { parseFrontmatter } from './frontmatter'

describe('parseFrontmatter', () => {
  it('returns empty meta and the full string as body when there is no frontmatter', () => {
    const result = parseFrontmatter('just some content')
    expect(result.meta).toEqual({ publish: false, tags: [], aliases: [] })
    expect(result.body).toBe('just some content')
  })

  it('sets publish to true when frontmatter contains publish: true', () => {
    const raw = '---\npublish: true\n---\nbody'
    const { meta } = parseFrontmatter(raw)
    expect(meta.publish).toBe(true)
  })

  it('sets publish to false when frontmatter omits publish', () => {
    const raw = '---\ntags:\n  - foo\n---\nbody'
    const { meta } = parseFrontmatter(raw)
    expect(meta.publish).toBe(false)
  })

  it('sets publish to false when frontmatter has publish: false', () => {
    const raw = '---\npublish: false\n---\nbody'
    const { meta } = parseFrontmatter(raw)
    expect(meta.publish).toBe(false)
  })

  it('extracts tags', () => {
    const raw = '---\ntags:\n  - foo\n  - bar\n---\nbody text'
    const { meta } = parseFrontmatter(raw)
    expect(meta.tags).toEqual(['foo', 'bar'])
  })

  it('extracts aliases', () => {
    const raw = '---\naliases:\n  - My Note\n---\nbody'
    const { meta } = parseFrontmatter(raw)
    expect(meta.aliases).toEqual(['My Note'])
  })

  it('extracts both tags and aliases together', () => {
    const raw = '---\ntags:\n  - tag1\naliases:\n  - alias1\n---\nbody'
    const { meta, body } = parseFrontmatter(raw)
    expect(meta.tags).toEqual(['tag1'])
    expect(meta.aliases).toEqual(['alias1'])
    expect(body).toBe('body')
  })

  it('handles CRLF line endings', () => {
    const raw = '---\r\ntags:\r\n  - foo\r\n---\r\nbody'
    const { meta } = parseFrontmatter(raw)
    expect(meta.tags).toEqual(['foo'])
  })
})
