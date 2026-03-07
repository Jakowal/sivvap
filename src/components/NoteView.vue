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
const noteTitle = ref('')
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
	noteTitle.value = data.meta.title || filePath.split('/').pop()?.replace(/\.md$/, '') || 'Wiki'
	document.title = noteTitle.value
}

watch(
	() => props.path,
	(path) => {
		loadNote(path || 'index')
	},
	{ immediate: true },
)
</script>
<template>
	<div v-if="note" id="note-view">
		<h2 class="note-title">{{ noteTitle }}</h2>
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
	</div>
</template>
<style lang="css">  
@media screen and (max-width: 900px) {
div#note-view {
		max-height: calc(100vh - 36px);
	}
}
@media screen and (min-width: 900px) {
div#note-view {
		max-height: 95vh;
	}
}
div#note-view {
	background: var(--bg-base-translucent);
	height: fit-content;
	max-width: 900px;
	width: 95vw;
	color: var(--text-body);
	font-size: 0.9rem;
	overflow: auto;
	margin: auto;
	padding: 4px;
}
.placeholder {
	color: var(--text-muted);
	margin-top: 4rem;
	font-size: 0.9rem;
}
.error { 
	color: var(--color-error);
	font-size: 0.9rem;
}
.note-title {
	text-align: center;
}
.frontmatter {
	margin-bottom: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;

	.fm-row { 
		display: flex; 
		align-items: center; 
		gap: 0.4rem; 
		flex-wrap: wrap; 
	}
	.fm-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		width: 3.5rem;
		flex-shrink: 0;
	}
	.fm-tag {
		background: var(--bg-primary-light);
		color: var(--color-primary-hover);
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		border: none;
		font-family: inherit;
		cursor: pointer;
	}
	.fm-tag:hover { 
		background: var(--bg-primary-light-hover);
	}
	.fm-alias {
		background: var(--bg-accent);
		color: var(--color-accent);
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
	}
}
.md h1, .md h2, .md h3, .md h4, .md h5, .md h6 {
	margin: 1.5rem 0 0.5rem;
	font-size: 1rem;
	color: var(--text-strong);
	font-family: inherit;
}
.md h1 { 
	font-size: 1.75rem; 
	border-bottom: 1px solid var(--border-heading);
	padding-bottom: 0.35rem; 
}
.md h2 { 
	font-size: 1.35rem; 
}
.md h3 { 
	font-size: 1.1rem; 
}
.md p  { 
	margin: 0.8rem 0; 
}
.md ul, .md ol { 
	margin: 0.5rem 0 0.5rem 1.5rem; 
}
.md li { 
	margin: 0.25rem 0; 
}
.md img { 
	max-width: 100%; 
}
.md code {
	background: var(--bg-surface-hover);
	padding: 0.1em 0.35em;
	border-radius: 3px;
	font-size: 0.88em;
	color: var(--text-code-inline);
}
.md pre { 
	background: var(--bg-surface-hover); 
	padding: 1rem; 
	border-radius: 6px; 
	overflow-x: auto; 
	margin: 1rem 0; 
}
.md pre code { 
	background: none; 
	padding: 0; 
	color: var(--text-code-block);
	font-size: 0.9em; 
}
.md blockquote {
	border-left: 3px solid var(--border-subtle);
	margin: 1rem 0;
	padding: 0.4rem 1rem;
	color: var(--text-blockquote);
}
.md hr  { 
	border: none; 
	border-top: 1px solid var(--border-default);
	margin: 1.5rem 0; 
}
.md strong { 
	color: var(--text-strong);
}
.md a {
	color: var(--color-primary);
}
.md a:hover {
	color: var(--color-primary-hover);
}
.md table { 
	border-collapse: collapse; 
	margin: 1rem 0; 
}
.md th, .md td { 
	border: 1px solid var(--border-default);
	padding: 0.4rem 0.75rem; 
}
.md th { 
	background: var(--bg-surface-hover);
	color: var(--text-table-header);
}
a.wiki-link {
	color: var(--color-primary);
	text-decoration: underline dotted;
}
a.wiki-link:hover {
	color: var(--color-primary-hover);
}
span.wiki-link.broken {
	color: var(--color-error);
	text-decoration: underline dotted; 
	cursor: default; 
}
</style>
