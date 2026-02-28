export function toUrlPath(filePath: string): string {
  return filePath
    .split('/')
    .map((seg, i, arr) => {
      // Strip .md extension from the final segment only
      const s = i === arr.length - 1 ? seg.replace(/\.md$/, '') : seg
      return encodeURIComponent(s.replace(/ /g, '-'))
    })
    .join('/')
}
