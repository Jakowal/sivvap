<script setup lang="ts">
import { ref, watch } from 'vue'
import { marked } from 'marked'
import type { VaultFile, AliasMap } from '../types'
import { preprocessWikiLinks } from '../utils/wikilinks'

const props = defineProps<{
  path: string
  aliasMap: AliasMap
  files: Record<string, VaultFile>
}>()

const emit = defineEmits<{ 'tag-search': [query: string] }>()

const note = ref<VaultFile | null>(null)
const html = ref('')
const error = ref('')

async function loadNote(path: string) {
  error.value = ''
  note.value = null
  html.value = ''

  const data = props.files[path]
  if (!data) { error.value = 'Note not found'; return }

  note.value = data
  // Rewrite [[wikilinks]] before passing to the markdown parser
  html.value = await marked.parse(preprocessWikiLinks(data.body, props.aliasMap))
  document.title = path.split('/').pop()?.replace(/\.md$/, '') ?? 'Wiki'
}

watch(
  () => props.path,
  (path) => {
    if (path) loadNote(path)
    else { note.value = null; error.value = '' }
  },
  { immediate: true },
)
</script>

<template>
  <p v-if="!props.path" class="placeholder">Select a note from the sidebar.</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <template v-else-if="note">
    <div v-if="note.meta.tags.length || note.meta.aliases.length" class="frontmatter">
      <div v-if="note.meta.tags.length" class="fm-row">
        <span class="fm-label">Tags</span>
        <button
          v-for="tag in note.meta.tags"
          :key="tag"
          class="fm-tag"
          @click="emit('tag-search', 'tag:' + tag)"
        >{{ tag }}</button>
      </div>
      <div v-if="note.meta.aliases.length" class="fm-row">
        <span class="fm-label">Aliases</span>
        <span v-for="alias in note.meta.aliases" :key="alias" class="fm-alias">{{ alias }}</span>
      </div>
    </div>
    <div class="md" v-html="html" />
  </template>
</template>
