<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { VaultFile } from '../types'
import { toUrlPath } from '../utils/urlpath'

defineProps<{ files: VaultFile[] }>()
const emit = defineEmits<{ select: [] }>()

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
  <div v-if="files.length" id="container">
    <div class="section-title">Recently Updated</div>
    <RouterLink
      v-for="file in files"
      :key="file.path"
      class="recent-item"
      :class="{ active: currentPath === toUrlPath(file.path) }"
      :to="'/' + toUrlPath(file.path)"
      @click="emit('select')"
    >
      <span class="recent-name">{{ noteName(file.path) }}</span>
      <span class="recent-date">{{ formatDate(file.lastUpdated!) }}</span>
    </RouterLink>
  </div>
</template>

<style scoped lang="css">
#container {
  overflow-y: auto;
  height: 30vh;
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
.recent-item:hover { 
  background: var(--bg-primary-subtle); 
}
.recent-name {
  color: var(--color-primary);
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.recent-date {
  color: var(--text-muted);
  font-size: 0.8rem;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
