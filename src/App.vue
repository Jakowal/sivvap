<script setup lang="ts">
import { ref } from 'vue'
import { processVaultFiles } from './utils/vault'
import vaultDates from 'virtual:vault-dates'
import Sidebar from './components/Sidebar.vue'

// Bundle all vault markdown files as raw strings at build time
const rawFiles = import.meta.glob('/Vault/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>

const { aliasMap, files, urlMap } = processVaultFiles(rawFiles, vaultDates)

const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)

function onTagSearch(query: string) {
	if (!sidebarRef.value) return
	sidebarRef.value.searchQuery = query
	sidebarRef.value.sidebarExpanded = true
}
</script>

<template>
	<Sidebar ref="sidebarRef"/>
	<main>
		<div>
			<RouterView v-slot="{ Component }">
				<component :is="Component" :alias-map="aliasMap" :files="files" :url-map="urlMap" @tag-search="onTagSearch" />
			</RouterView>
		</div>
	</main>
</template>
