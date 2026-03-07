export interface TreeNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: TreeNode[]
}

export interface NoteMeta {
  publish: boolean | string
  tags: string[]
  aliases: string[]
  title: string | null
}

export interface VaultFile {
  path: string
  meta: NoteMeta
  body: string
  lastUpdated: string | null
}

export type AliasMap = Record<string, string>
