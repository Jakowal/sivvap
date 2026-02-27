import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { join } from 'node:path'
import {
  findVaultRoot,
  buildTree,
  buildAliasMap,
  searchVault,
  readVaultFile,
} from './src/utils/vault'

function registerApiRoutes(middlewares: import('vite').Connect.Server): void {
  const vaultRoot = findVaultRoot(join(process.cwd(), 'Vault'))

  middlewares.use('/api/vault-tree', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(buildTree(vaultRoot, vaultRoot)))
  })

  middlewares.use('/api/vault-file', (req, res) => {
    const path = new URL(req.url!, 'http://localhost').searchParams.get('path') ?? ''
    const result = readVaultFile(vaultRoot, path)
    if ('error' in result) {
      res.statusCode = result.error
      res.end(result.message)
      return
    }
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result))
  })

  middlewares.use('/api/vault-search', (req, res) => {
    const q = new URL(req.url!, 'http://localhost').searchParams.get('q') ?? ''
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(searchVault(vaultRoot, q)))
  })

  middlewares.use('/api/vault-aliases', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(buildAliasMap(vaultRoot)))
  })
}

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'vault-api',
      configureServer(server) { registerApiRoutes(server.middlewares) },
      configurePreviewServer(server) { registerApiRoutes(server.middlewares) },
    },
  ],
})
