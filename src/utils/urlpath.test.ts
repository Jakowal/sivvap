import { describe, it, expect } from 'vitest'
import { toUrlPath } from './urlpath'

describe('toUrlPath', () => {
  it('strips the .md extension', () => {
    expect(toUrlPath('note.md')).toBe('note')
  })

  it('replaces spaces with dashes', () => {
    expect(toUrlPath('My Note.md')).toBe('My-Note')
  })

  it('preserves folder segments and replaces their spaces too', () => {
    expect(toUrlPath('My Folder/My Note.md')).toBe('My-Folder/My-Note')
  })

  it('does not strip .md from non-final segments', () => {
    expect(toUrlPath('folder.md/note.md')).toBe('folder.md/note')
  })

  it('leaves parentheses unencoded (encodeURIComponent does not encode them)', () => {
    expect(toUrlPath('Note (1).md')).toBe('Note-(1)')
  })

  it('leaves a plain name with no spaces or extension unchanged', () => {
    expect(toUrlPath('notes/readme.md')).toBe('notes/readme')
  })
})
