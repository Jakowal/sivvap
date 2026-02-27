<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TreeNode } from '../types'

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
      :class="{ active: currentPath === node.path }"
      :to="'/' + node.path"
    >{{ node.name.replace(/\.md$/, '') }}</RouterLink>
  </template>
</template>
