import { describe, it, expect } from 'vitest'
import { preprocessWikiLinks } from './wikilinks'

describe('preprocessWikiLinks', () => {
  it('leaves text with no wikilinks unchanged', () => {
    expect(preprocessWikiLinks('just some text', {})).toBe('just some text')
  })

  it('resolves a known link to an anchor tag', () => {
    const result = preprocessWikiLinks('[[My Note]]', { 'My Note': 'My Note.md' })
    expect(result).toContain('<a class="wiki-link"')
    expect(result).toContain('href="#/My-Note"') // .md stripped, spaces become dashes
    expect(result).toContain('>My Note</a>')
  })

  it('uses the display text when [[target|display]] syntax is used', () => {
    const result = preprocessWikiLinks('[[target|click here]]', { target: 'target.md' })
    expect(result).toContain('>click here</a>')
    expect(result).not.toContain('>target<')
  })

  it('renders a broken span for unresolved links', () => {
    const result = preprocessWikiLinks('[[missing]]', {})
    expect(result).toContain('<span class="wiki-link broken"')
    expect(result).toContain('missing')
  })

  it('falls back to lowercase for case-insensitive resolution', () => {
    const result = preprocessWikiLinks('[[My Note]]', { 'my note': 'my-note.md' })
    expect(result).toContain('<a class="wiki-link"')
  })

  it('escapes HTML in display text', () => {
    const result = preprocessWikiLinks('[[<script>]]', {})
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })
})

describe('embed transclusion (![[...]])', () => {
  const files = {
    'Note.md': { path: 'Note.md', meta: { publish: true, tags: [], aliases: [], title: null }, body: 'Note body content', lastUpdated: null },
    'Headed.md': {
      path: 'Headed.md',
      meta: { publish: true, tags: [], aliases: [], title: null },
      body: '# Intro\nIntro text\n## Details\nDetail text\n## Other\nOther text',
      lastUpdated: null,
    },
  }
  const aliasMap = { 'Note': 'Note.md', 'Headed': 'Headed.md' }

  it('embeds full file content with ![[target]]', () => {
    const result = preprocessWikiLinks('![[Note]]', aliasMap, files)
    expect(result).toContain('<blockquote class="embed">')
    expect(result).toContain('Note body content')
    expect(result).toContain('<a class="embed-title" href="#/Note">')
  })

  it('embeds a specific heading section with ![[target#heading]]', () => {
    const result = preprocessWikiLinks('![[Headed#Details]]', aliasMap, files)
    expect(result).toContain('Detail text')
    expect(result).not.toContain('Intro text')
    expect(result).not.toContain('Other text')
  })

  it('uses display text for embed title with ![[target#heading|display]]', () => {
    const result = preprocessWikiLinks('![[Headed#Details|My Title]]', aliasMap, files)
    expect(result).toContain('My Title')
  })

  it('renders broken span for unresolved embed', () => {
    const result = preprocessWikiLinks('![[missing]]', {}, files)
    expect(result).toContain('<span class="wiki-link broken"')
    expect(result).toContain('missing')
  })

  it('falls back to full content when heading is not found', () => {
    const result = preprocessWikiLinks('![[Headed#Nonexistent]]', aliasMap, files)
    expect(result).toContain('Intro text')
    expect(result).toContain('Detail text')
  })

  it('limits recursion depth', () => {
    const recursiveFiles = {
      'A.md': { path: 'A.md', meta: { publish: true, tags: [], aliases: [], title: null }, body: '![[A]]', lastUpdated: null },
    }
    const result = preprocessWikiLinks('![[A]]', { 'A': 'A.md' }, recursiveFiles)
    // Should not hang — the inner ![[A]] should stop being expanded at the depth limit
    expect(result).toContain('<blockquote class="embed">')
  })
})
