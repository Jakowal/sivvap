<script setup lang="ts">
import { ref, watch } from 'vue'
import { processVaultFiles } from './utils/vault'
import { searchFiles } from './utils/search'
import vaultDates from 'virtual:vault-dates'
import Sidebar from './components/Sidebar.vue'

// Bundle all vault markdown files as raw strings at build time
const rawFiles = import.meta.glob('/Vault/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>

const { aliasMap, files, urlMap } = processVaultFiles(rawFiles, vaultDates)

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
	<Sidebar/>
	<main>
    <div>
		<RouterView v-slot="{ Component }">
			<component :is="Component" :alias-map="aliasMap" :files="files" :url-map="urlMap" @tag-search="searchQuery = $event" />
		</RouterView>
    </div>
	</main>
</template>
