<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TreeNode } from '../types'
import { toUrlPath } from '../utils/urlpath'

defineProps<{ nodes: TreeNode[] }>()

const route = useRoute()
const currentPath = computed(() =>
  ([] as string[]).concat(route.params.pathMatch as string | string[]).filter(Boolean).join('/'),
)
</script>

<template>
  <template v-for="node in nodes" :key="node.path">
    <details v-if="node.type === 'dir'" class="tree-dir" open>
      <summary>{{ node.name }}</summary>
      <div class="tree-children">
        <SidebarTree :nodes="node.children ?? []" />
      </div>
    </details>
    <RouterLink
      v-else-if="node.name.endsWith('.md')"
      class="tree-file"
      :class="{ active: currentPath === toUrlPath(node.path) }"
      :to="'/' + toUrlPath(node.path)"
    >{{ node.name.replace(/\.md$/, '') }}</RouterLink>
  </template>
</template>

<style scoped>
details.tree-dir > summary {
  cursor: pointer;
  list-style: none;
  padding: 0.2rem 0.5rem;
  color: #6b7280;
  font-size: 0.85rem;
  user-select: none;
  border-radius: 4px;
}
details.tree-dir > summary::-webkit-details-marker { display: none; }
details.tree-dir > summary::before { content: '▶ '; font-size: 0.65rem; }
details.tree-dir[open] > summary::before { content: '▼ '; }
details.tree-dir > summary:hover { background: #f3f4f6; color: #1a1a1a; }
.tree-children { padding-left: 1rem; }

a.tree-file {
  display: block;
  padding: 0.2rem 0.5rem;
  font-size: 0.85rem;
  color: #2563eb;
  border-radius: 4px;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
a.tree-file:hover { background: #eff6ff; }
a.tree-file.active { background: #dbeafe; color: #1d4ed8; font-weight: bold; }
</style>
