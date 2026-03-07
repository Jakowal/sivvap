import { defineConfig } from 'vitest/config'
import { globSync, statSync } from 'node:fs'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

function vaultDatesPlugin(): Plugin {
  return {
    name: 'vault-dates',
    resolveId(id) {
      if (id === 'virtual:vault-dates') return '\0virtual:vault-dates'
    },
    load(id) {
      if (id !== '\0virtual:vault-dates') return
      const root = process.cwd()
      const files = globSync('Vault/**/*.md', { cwd: root })
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
  test: {
    environment: 'node',
  },
})
