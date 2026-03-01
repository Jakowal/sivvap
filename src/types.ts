export interface TreeNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: TreeNode[]
}

export interface NoteMeta {
  publish: boolean
  tags: string[]
  aliases: string[]
}

export interface VaultFile {
  path: string
  meta: NoteMeta
  body: string
  lastUpdated: string | null
}

export type AliasMap = Record<string, string>
