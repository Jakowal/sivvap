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
