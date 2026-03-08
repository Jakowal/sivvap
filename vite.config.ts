import { defineConfig } from 'vitest/config'
import { globSync, statSync } from 'node:fs'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

// Set VAULT_PATH to build from a specific subfolder, e.g.:
//   VAULT_PATH=Worldbuilding/Tessam npm run build
const vaultPath = process.env.VAULT_PATH || ''
const vaultGlob = vaultPath ? `Vault/${vaultPath}/**/*.md` : 'Vault/**/*.md'

function vaultDatesPlugin(): Plugin {
  return {
    name: 'vault-dates',
    resolveId(id) {
      if (id === 'virtual:vault-dates') return '\0virtual:vault-dates'
    },
    load(id) {
      if (id !== '\0virtual:vault-dates') return
      const root = process.cwd()
      const files = globSync(vaultGlob, { cwd: root })
      const dates: Record<string, string | null> = {}
      for (const file of files) {
        try {
          const mtime = statSync(`${root}/${file}`).mtime.toISOString()
          dates['/' + file] = mtime
        } catch {
          dates['/' + file] = null
        }
      }
      return `export default ${JSON.stringify(dates)}`
    },
  }
}

export default defineConfig({
  plugins: [vue(), vaultDatesPlugin()],
  define: {
    __VAULT_PATH__: JSON.stringify(vaultPath),
  },
  preview: {
    allowedHosts: ['tessam.jawa.no'],
  },
  test: {
    environment: 'node',
  },
})
