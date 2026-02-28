<script setup lang="ts">
import { ref, watch } from 'vue'
import { marked } from 'marked'
import type { VaultFile, AliasMap } from '../types'
import { preprocessWikiLinks } from '../utils/wikilinks'
import { stripComments } from '../utils/comments'

const props = defineProps<{
  path: string
  aliasMap: AliasMap
  files: Record<string, VaultFile>
  urlMap: Record<string, string>
}>()

const emit = defineEmits<{ 'tag-search': [query: string] }>()

const note = ref<VaultFile | null>(null)
const html = ref('')
const error = ref('')

async function loadNote(path: string) {
  error.value = ''
  note.value = null
  html.value = ''

  const filePath = props.urlMap[path] ?? path
  const data = props.files[filePath]
  if (!data) { error.value = 'Note not found'; return }

  note.value = data
  const body = stripComments(data.body)
  // Rewrite [[wikilinks]] before passing to the markdown parser
  html.value = await marked.parse(preprocessWikiLinks(body, props.aliasMap))
  document.title = filePath.split('/').pop()?.replace(/\.md$/, '') ?? 'Wiki'
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

<style>
.placeholder { color: #9ca3af; margin-top: 4rem; font-size: 0.9rem; }
.error { color: #dc2626; font-size: 0.9rem; }

.frontmatter {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.6rem 0.9rem;
  margin-bottom: 1.5rem;
  background: #f9fafb;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.fm-row { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
.fm-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  width: 3.5rem;
  flex-shrink: 0;
}
.fm-tag {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  border: none;
  font-family: monospace;
  cursor: pointer;
}
.fm-tag:hover { background: #bfdbfe; }
.fm-alias {
  background: #ede9fe;
  color: #6d28d9;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.md h1, .md h2, .md h3, .md h4, .md h5, .md h6 {
  margin: 1.5rem 0 0.5rem;
  color: #111827;
  line-height: 1.3;
  font-family: sans-serif;
}
.md h1 { font-size: 1.75rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.35rem; }
.md h2 { font-size: 1.35rem; }
.md h3 { font-size: 1.1rem; }
.md p  { margin: 0.8rem 0; line-height: 1.75; }
.md ul, .md ol { margin: 0.5rem 0 0.5rem 1.5rem; }
.md li { margin: 0.25rem 0; line-height: 1.65; }
.md code {
  background: #f3f4f6;
  padding: 0.1em 0.35em;
  border-radius: 3px;
  font-size: 0.88em;
  color: #b45309;
}
.md pre { background: #f3f4f6; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 1rem 0; }
.md pre code { background: none; padding: 0; color: #1a1a1a; font-size: 0.9em; }
.md blockquote {
  border-left: 3px solid #d1d5db;
  margin: 1rem 0;
  padding: 0.4rem 1rem;
  color: #6b7280;
}
.md hr  { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
.md strong { color: #111827; }
.md a { color: #2563eb; }
.md a:hover { color: #1d4ed8; }
.md table { border-collapse: collapse; margin: 1rem 0; }
.md th, .md td { border: 1px solid #e5e7eb; padding: 0.4rem 0.75rem; }
.md th { background: #f9fafb; color: #374151; }

a.wiki-link       { color: #2563eb; text-decoration: underline dotted; }
a.wiki-link:hover { color: #1d4ed8; }
span.wiki-link.broken { color: #dc2626; text-decoration: underline dotted; cursor: default; }
</style>
