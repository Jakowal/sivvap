export interface TreeNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: TreeNode[]
}

export interface NoteMeta {
  tags: string[]
  aliases: string[]
}

export interface VaultFile {
  path: string
  meta: NoteMeta
  body: string
}

export type AliasMap = Record<string, string>
