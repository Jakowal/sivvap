<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { TreeNode, AliasMap } from './types'
import SidebarTree from './components/SidebarTree.vue'
import SearchResults from './components/SearchResults.vue'

const tree = ref<TreeNode[]>([])
const aliasMap = ref<AliasMap>({})
const initError = ref('')

const searchQuery = ref('')
const searchResults = ref<{ path: string; title: string; excerpt: string }[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (q) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!q.trim()) { searchResults.value = []; return }
  searchTimer = setTimeout(async () => {
    const res = await fetch('/api/vault-search?q=' + encodeURIComponent(q))
    searchResults.value = await res.json()
  }, 200)
})

onMounted(async () => {
  try {
    const [treeRes, aliasRes] = await Promise.all([
      fetch('/api/vault-tree'),
      fetch('/api/vault-aliases'),
    ])
    tree.value = (await treeRes.json()) as TreeNode[]
    aliasMap.value = (await aliasRes.json()) as AliasMap
  } catch (err) {
    initError.value = `Failed to initialize: ${String(err)}`
  }
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
      <p v-if="initError" class="error">{{ initError }}</p>
      <RouterView v-else v-slot="{ Component }">
        <component :is="Component" :alias-map="aliasMap" @tag-search="searchQuery = $event" />
      </RouterView>
    </div>
  </main>
</template>
