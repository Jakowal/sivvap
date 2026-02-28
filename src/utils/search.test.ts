import { describe, it, expect } from 'vitest'
import { searchFiles } from './search'
import type { VaultFile } from '../types'

function makeFile(path: string, body: string, tags: string[] = []): VaultFile {
  return { path, body, meta: { tags, aliases: [] } }
}

describe('searchFiles', () => {
  it('returns empty array for an empty or whitespace query', () => {
    const files = { 'note.md': makeFile('note.md', 'content') }
    expect(searchFiles(files, '')).toEqual([])
    expect(searchFiles(files, '   ')).toEqual([])
  })

  it('matches by title (filename stem)', () => {
    const files = { 'my-note.md': makeFile('my-note.md', 'irrelevant body') }
    const results = searchFiles(files, 'my-note')
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('my-note')
  })

  it('matches by body content and includes a highlighted excerpt', () => {
    const files = { 'note.md': makeFile('note.md', 'hello world') }
    const results = searchFiles(files, 'hello')
    expect(results).toHaveLength(1)
    expect(results[0].excerpt).toContain('<mark>hello</mark>')
  })

  it('matches each word independently for a multi-word query', () => {
    // 'cat' and 'mat' are not adjacent, so a phrase search would miss this
    const files = { 'note.md': makeFile('note.md', 'the cat sat on the mat') }
    const results = searchFiles(files, 'cat mat')
    expect(results).toHaveLength(1)
  })

  it('highlights all matched terms in the excerpt', () => {
    const files = { 'note.md': makeFile('note.md', 'the cat sat on the mat') }
    const results = searchFiles(files, 'cat mat')
    expect(results[0].excerpt).toContain('<mark>cat</mark>')
    expect(results[0].excerpt).toContain('<mark>mat</mark>')
  })

  it('excerpt shows context before and after the match', () => {
    // 'word '.repeat(20) = 100 chars before; ' word'.repeat(30) = 150 chars after
    // anchor=100, start=40, end=min(256,220)=220 < 256 → both ellipses fire
    const body = 'word '.repeat(20) + 'TARGET' + ' word'.repeat(30)
    const files = { 'note.md': makeFile('note.md', body) }
    const results = searchFiles(files, 'target')
    expect(results[0].excerpt).toMatch(/^…/)           // truncated at start
    expect(results[0].excerpt).toContain('<mark>TARGET</mark>')
    expect(results[0].excerpt).toMatch(/…$/)           // truncated at end
  })

  it('filters by tag using the "tag:" prefix', () => {
    const files = {
      'a.md': makeFile('a.md', 'body', ['typescript']),
      'b.md': makeFile('b.md', 'body', ['javascript']),
    }
    const results = searchFiles(files, 'tag:typescript')
    expect(results).toHaveLength(1)
    expect(results[0].path).toBe('a.md')
  })

  it('tag filter returns an empty excerpt', () => {
    const files = { 'a.md': makeFile('a.md', 'body', ['foo']) }
    const results = searchFiles(files, 'tag:foo')
    expect(results[0].excerpt).toBe('')
  })

  it('caps results at 20', () => {
    const files: Record<string, VaultFile> = {}
    for (let i = 0; i < 30; i++) files[`note${i}.md`] = makeFile(`note${i}.md`, 'matching text')
    expect(searchFiles(files, 'matching')).toHaveLength(20)
  })

  it('escapes HTML in the excerpt', () => {
    const files = { 'note.md': makeFile('note.md', 'a <b>bold</b> match') }
    const results = searchFiles(files, 'bold')
    expect(results[0].excerpt).not.toContain('<b>')
    expect(results[0].excerpt).toContain('&lt;b&gt;')
  })
})
