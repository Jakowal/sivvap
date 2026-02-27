<script setup lang="ts">
import { ref, watch } from 'vue'
import { processVaultFiles } from './utils/vault'
import { searchFiles } from './utils/search'
import SidebarTree from './components/SidebarTree.vue'
import SearchResults from './components/SearchResults.vue'

// Bundle all vault markdown files as raw strings at build time
const rawFiles = import.meta.glob('/Vault/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const { tree, aliasMap, files } = processVaultFiles(rawFiles)

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
    <SidebarTree v-else :nodes="tree" />
  </nav>
  <main id="content">
    <div id="content-inner">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :alias-map="aliasMap" :files="files" @tag-search="searchQuery = $event" />
      </RouterView>
    </div>
  </main>
</template>
