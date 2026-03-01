<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { VaultFile } from '../types'
import { toUrlPath } from '../utils/urlpath'

defineProps<{ files: VaultFile[] }>()

const route = useRoute()
const currentPath = computed(() =>
  ([] as string[]).concat(route.params.pathMatch as string | string[]).filter(Boolean).join('/'),
)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function noteName(path: string): string {
  return path.split('/').at(-1)!.replace(/\.md$/, '')
}
</script>

<template>
  <div v-if="files.length" class="recent-files">
    <div class="recent-title">Recent</div>
    <RouterLink
      v-for="file in files"
      :key="file.path"
      class="recent-item"
      :class="{ active: currentPath === toUrlPath(file.path) }"
      :to="'/' + toUrlPath(file.path)"
    >
      <span class="recent-name">{{ noteName(file.path) }}</span>
      <span class="recent-date">{{ formatDate(file.lastUpdated!) }}</span>
    </RouterLink>
  </div>
</template>

<style scoped>
.recent-files {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}
.recent-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #9ca3af;
  padding: 0 0.5rem 0.4rem;
}
.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-decoration: none;
  gap: 0.5rem;
}
.recent-item:hover { background: #eff6ff; }
.recent-item.active { background: #dbeafe; }
.recent-name {
  color: #2563eb;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.recent-item.active .recent-name { color: #1d4ed8; font-weight: bold; }
.recent-date {
  color: #9ca3af;
  font-size: 0.7rem;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
