import type { TreeNode } from '../types'

export function buildTreeFromPaths(relPaths: string[]): TreeNode[] {
  // Map from dir path → its children array, seeded with the root
  const children = new Map<string, TreeNode[]>()
  children.set('', [])

  for (const relPath of [...relPaths].sort()) {
    const parts = relPath.split('/')
    // Ensure every ancestor directory node exists before adding the file
    for (let i = 1; i < parts.length; i++) {
      const dirPath = parts.slice(0, i).join('/')
      if (!children.has(dirPath)) {
        const parentPath = parts.slice(0, i - 1).join('/')
        const dirNode: TreeNode = { name: parts[i - 1], path: dirPath, type: 'dir', children: [] }
        children.set(dirPath, dirNode.children!)
        children.get(parentPath)!.push(dirNode)
      }
    }
    const parentPath = parts.slice(0, -1).join('')
      ? parts.slice(0, -1).join('/')
      : ''
    children.get(parentPath)!.push({ name: parts.at(-1)!, path: relPath, type: 'file' })
  }

  // Sort recursively: directories before files, then alphabetically within each group
  function sortNodes(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    for (const node of nodes) if (node.children) sortNodes(node.children)
  }

  const root = children.get('')!
  sortNodes(root)
  return root
}
