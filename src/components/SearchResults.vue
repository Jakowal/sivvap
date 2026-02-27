<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{ results: { path: string; title: string; excerpt: string }[] }>()

const emit = defineEmits<{ select: [] }>()

const route = useRoute()
const currentPath = computed(() =>
  ([] as string[]).concat(route.params.pathMatch as string | string[]).filter(Boolean).join('/'),
)
</script>

<template>
  <p v-if="results.length === 0" class="no-results">No results</p>
  <RouterLink
    v-for="result in results"
    :key="result.path"
    class="search-result"
    :class="{ active: currentPath === result.path }"
    :to="'/' + result.path"
    @click="emit('select')"
  >
    <span class="sr-title">{{ result.title }}</span>
    <span v-if="result.excerpt" class="sr-excerpt" v-html="result.excerpt" />
  </RouterLink>
</template>
