<script setup lang="ts">
import { ref, watch } from 'vue'
import { processVaultFiles } from './utils/vault'
import { searchFiles } from './utils/search'
import type { VaultFile } from './types'
import vaultDates from 'virtual:vault-dates'
import SidebarTree from './components/SidebarTree.vue'
import SearchResults from './components/SearchResults.vue'
import RecentFiles from './components/RecentFiles.vue'

// Bundle all vault markdown files as raw strings at build time
const rawFiles = import.meta.glob('/Vault/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const { tree, aliasMap, files, urlMap } = processVaultFiles(rawFiles, vaultDates)

const recentFiles = Object.values(files)
  .filter((f): f is VaultFile & { lastUpdated: string } => f.lastUpdated !== null)
  .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
  .slice(0, 10)

const searchQuery = ref('')
const searchResults = ref<{ path: string; title: string; excerpt: string }[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

// Debounce search so it doesn't run on every keystroke
watch(searchQuery, (q) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!q.trim()) { searchResults.value = []; return }
  searchTimer = setTimeout(() => {
    searchResults.value = searchFiles(files, q)
  }, 200)
})
</script>

<template>
  <nav id="sidebar">
    <div id="sidebar-title">Wiki</div>
    <div id="search-box">
      <input
        v-model="searchQuery"
        id="search-input"
        type="search"
        placeholder="Search…"
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <SearchResults
      v-if="searchQuery.trim()"
      :results="searchResults"
      @select="searchQuery = ''"
    />
    <template v-else>
      <SidebarTree :nodes="tree" />
      <RecentFiles :files="recentFiles" />
    </template>
  </nav>
  <main id="content">
    <div id="content-inner">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :alias-map="aliasMap" :files="files" :url-map="urlMap" @tag-search="searchQuery = $event" />
      </RouterView>
    </div>
  </main>
</template>

<style scoped>
nav#sidebar {
  width: 260px;
  min-width: 160px;
  overflow-y: auto;
  border-right: 1px solid #e5e7eb;
  padding: 1rem 0.5rem;
  flex-shrink: 0;
  background: #f9fafb;
}
#sidebar-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #9ca3af;
  padding: 0 0.5rem 0.75rem;
}
#search-box { padding: 0 0.5rem 0.6rem; }
#search-input {
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
  background: #fff;
  color: #1a1a1a;
  outline: none;
}
#search-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px #dbeafe; }

main#content {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem 3rem;
}
#content-inner { max-width: 760px; }
</style>
