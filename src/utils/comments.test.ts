import { describe, it, expect } from 'vitest'
import { stripComments } from './comments'

describe('stripComments', () => {
  it('leaves text with no comments unchanged', () => {
    expect(stripComments('just some text')).toBe('just some text')
  })

  it('removes an inline comment', () => {
    expect(stripComments('before %% comment %% after')).toBe('before  after')
  })

  it('removes a multiline comment', () => {
    const input = 'before\n%%\nHere is a comment\nIt spans multiple lines\n%%\nafter'
    expect(stripComments(input)).toBe('before\n\nafter')
  })

  it('removes multiple comments', () => {
    expect(stripComments('%% one %% text %% two %%')).toBe(' text ')
  })

  it('removes a comment at the start of the string', () => {
    expect(stripComments('%% comment %% text')).toBe(' text')
  })

  it('removes a comment at the end of the string', () => {
    expect(stripComments('text %% comment %%')).toBe('text ')
  })

  it('handles an empty comment', () => {
    expect(stripComments('text %%%% more')).toBe('text  more')
  })
})
