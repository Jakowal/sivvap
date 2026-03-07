<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { toUrlPath } from '../utils/urlpath'

defineProps<{ results: { path: string; title: string; excerpt: string }[] }>()

const emit = defineEmits<{ select: [] }>()

const route = useRoute()
const currentPath = computed(() =>
  ([] as string[]).concat(route.params.pathMatch as string | string[]).filter(Boolean).join('/'),
)
</script>

<template>
  <p v-if="results.length === 0" class="no-results">No results</p>
  <div id="results">
    <RouterLink
      v-for="result in results"
      :key="result.path"
      class="search-result"
      :class="{ active: currentPath === toUrlPath(result.path) }"
      :to="'/' + toUrlPath(result.path)"
      @click="emit('select')"
    >
      <span class="sr-title">{{ result.title }}</span>
      <span v-if="result.excerpt" class="sr-excerpt" v-html="result.excerpt" />
    </RouterLink>
  </div>
</template>

<style scoped lang="css">
#results {
  height:90vh;
  overflow-y: auto;
}
.search-result {
  display: block;
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  text-decoration: none;
  color: inherit;
  margin-bottom: 0.1rem;
}
.search-result:hover {
  background: var(--bg-overlay);
}
.search-result.active {
  background: var(--bg-overlay);
}
.sr-title { 
  display: block; 
  color: var(--text-search-title);
  font-size: 0.85rem; 
  font-weight: bold; 
}
.sr-excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-strong);
  font-size: 0.75rem;
  margin-top: 0.15rem;
  line-height: 1.4;
}
.no-results { 
  color: var(--text-muted);
  font-size: 0.8rem; 
  padding: 0.25rem 0.5rem; 
}
.sr-excerpt :deep(mark) {
  background: var(--bg-highlight);
  color: var(--text-highlight);
  border-radius: 2px;
  padding: 0 1px;
  font-style: normal;
}
</style>
