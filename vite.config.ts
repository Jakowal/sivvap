import { defineConfig } from 'vitest/config'
import { execSync } from 'node:child_process'
import { globSync } from 'node:fs'
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
          const date = execSync(`git log -1 --format=%aI -- "${file}"`, {
            cwd: root,
            encoding: 'utf-8',
          }).trim()
          dates['/' + file] = date || null
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
