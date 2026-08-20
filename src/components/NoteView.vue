<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { marked, Renderer } from 'marked'
import type { VaultFile, AliasMap } from '../types'
import { preprocessWikiLinks } from '../utils/wikilinks'
import { stripComments } from '../utils/comments'
import { toUrlPath } from '../utils/urlpath'

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
const hiddenTags = new Set(['pathfinder', 'tessam'])
const noteViewEl = ref<HTMLElement | null>(null)
let pendingFragment = ''

function slugify(text: string): string {
	return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')
}

function scrollToFragmentOrTop() {
	if (!noteViewEl.value) return
	if (pendingFragment) {
		const el = noteViewEl.value.querySelector(`#${CSS.escape(pendingFragment)}`)
		if (el) { el.scrollIntoView({ block: 'start' }); pendingFragment = ''; return }
	}
	pendingFragment = ''
	window.scrollTo(0, 0)
}

function onNoteClick(e: MouseEvent) {
	const anchor = (e.target as HTMLElement).closest?.('a[href^="#/"]')
	if (!anchor) return
	const href = anchor.getAttribute('href')!
	const hashIdx = href.indexOf('#', 2)
	if (hashIdx >= 0) {
		pendingFragment = slugify(decodeURIComponent(href.slice(hashIdx + 1)))
	}
}

async function loadNote(path: string) {
	error.value = ''
	note.value = null
	html.value = ''

	const filePath = props.urlMap[path] ?? path
	const data = props.files[filePath]
	if (!data) { error.value = 'Note not found'; return }

	note.value = data
	const body = stripComments(data.body)

	const renderer = new Renderer()
	renderer.heading = ({ text, depth }) => {
		const id = slugify(text.replace(/<[^>]*>/g, ''))
		return `<h${depth} id="${id}">${text}</h${depth}>\n`
	}
	renderer.link = ({ href, text }) => {
		// Skip external links and anchor-only links
		if (!href || /^(https?:|mailto:|#)/.test(href)) {
			return `<a href="${href}">${text}</a>`
		}
		const hashIdx = href.indexOf('#')
		const base = hashIdx >= 0 ? href.slice(0, hashIdx) : href
		const fragment = hashIdx >= 0 ? href.slice(hashIdx) : ''
		const resolved = props.aliasMap[base] ?? props.aliasMap[base.toLowerCase()] ?? null
		if (resolved === null) {
			return `<span class="wiki-link broken">${text}</span>`
		}
		return `<a class="wiki-link" href="#/${toUrlPath(resolved)}${fragment}">${text}</a>`
	}

	// Rewrite [[wikilinks]] before passing to the markdown parser
	html.value = await marked.parse(preprocessWikiLinks(body, props.aliasMap, props.files), { renderer })
	noteTitle.value = data.meta.title || filePath.split('/').pop()?.replace(/\.md$/, '') || 'Wiki'
	document.title = noteTitle.value
	await nextTick()
	scrollToFragmentOrTop()
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
	<div v-if="note" id="note-view" ref="noteViewEl" @click="onNoteClick">
		<div class="note-header">
			<div class="note-title">
				<h2 class="note-title">{{ noteTitle }}</h2>
				<button @click=onNoteClick class="icon"><div>✖</div></button>
			</div>
			<div v-if="note.meta.tags.some(t => !hiddenTags.has(t))" class="frontmatter">
				<div class="fm-row">
					<span class="fm-label">Tags</span>
					<template v-for="tag in note.meta.tags" :key="tag">
						<button
							v-if="!hiddenTags.has(tag)"
							class="fm-tag"
							@click="emit('tag-search', 'tag:' + tag)"
						>{{ tag }}</button>
					</template>
				</div>
			</div>
		</div>
		<div class="md" v-html="html" />
	</div>
</template>
<style lang="css">  
div#note-view {
	background: var(--bg-text);
	max-width: 900px;
	width: 95vw;
	color: var(--text-color);
	font-size: 0.9rem;
	margin: auto;
	padding: 16px;
	border-radius: var(--item-border-radius);
	outline: solid 2px var(--border-light);
	border: solid 2px var(--border-dark); 
}
@media screen and (max-width: 900px) {
	div#note-view {
		margin-bottom: 34px;
	}
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
.note-header {
	display: flex;
	justify-content: space-between;
	flex-direction: column;
	position: sticky;
	top: 0;
	z-index: 1;
	background: var(--bg-text);
	border-radius: var(--item-border-radius);
	outline: solid 2px var(--border-light);
	border: solid 2px var(--border-dark); 
	padding: 4px 4px 0.5rem 4px;
}
.note-title {
	display: flex;
	justify-content: space-between;
}
.icon {
	all: unset;
	background: var(--bg-text);
	color: var(--text-color);
	cursor: pointer;
	width: 1rem;
	height: 1rem;
	text-align: center;
	border-radius: var(--item-border-radius);
	outline: solid 2px var(--border-light);
	border: solid 2px var(--border-dark); 
}
.note-title {
	text-align: center;
}
.frontmatter {
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
		color: var(--text-weak);
		width: 3.5rem;
		flex-shrink: 0;
	}
	.fm-tag {
		background: var(--border-light);
		color: var(--text-color);
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		border: none;
		font-family: inherit;
		cursor: pointer;
	}
	.fm-tag:hover {
		background: var(--border-dark);
	}
}
.md h1, .md h2, .md h3, .md h4, .md h5, .md h6 {
	margin: 1.5rem 0 0.5rem;
	font-size: 1rem;
	color: var(--text-color);
	font-family: inherit;
}
.md h1 { 
	font-size: 1.75rem; 
	border-bottom: 1px solid var(--border-dark);
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
	border-radius: var(--element-border-radius);
	max-width: 100%; 
}
.md code {
	background: var(--border-light);
	padding: 0.1em 0.35em;
	border-radius: 3px;
	font-size: 0.88em;
	color: var(--text-code-inline);
}
.md pre { 
	background: var(--border-light); 
	padding: 1rem; 
	border-radius: 6px; 
	overflow-x: auto; 
	margin: 1rem 0; 
}
.md pre code { 
	background: none; 
	padding: 0; 
	color: var(--text-weak);
	font-size: 0.9em; 
}
.md blockquote {
	border-left: 3px solid var(--border-light);
	margin: 1rem 0;
	padding: 0.4rem 1rem;
	color: var(--text-weak);
}
.md hr  { 
	border: none; 
	border-top: 1px solid var(--border-dark);
	margin: 1.5rem 0; 
}
.md strong { 
	color: var(--text-color);
}
.md a {
	color: var(--text-weak);
}
.md a:hover {
	color: var(--text-color);
}
.md table {
	border-collapse: collapse;
	margin: 1rem 0;
	width: 100%;
}
.md th, .md td {
	border: 1px solid var(--border-light);
	padding: 0.4rem 0.75rem;
	text-align: left;
}
.md th {
	background: var(--border-light);
	color: var(--text-body);
	font-weight: bold;
}
a.wiki-link {
	color: var(--text-weak);
	text-decoration: underline dotted;
}
a.wiki-link:hover {
	color: var(--text-color);
}
span.wiki-link.broken {
	color: var(--color-error);
	text-decoration: underline dotted;
	cursor: default;
}
blockquote.embed {
	border-left: 3px solid var(--text-weak);
	background: var(--border-light);
	margin: 1rem 0;
	padding: 0.6rem 1rem;
	border-radius: 4px;
}
blockquote.embed .embed-title {
	display: block;
	color: var(--text-weak);
	font-weight: bold;
	text-decoration: none;
	margin-bottom: 0.4rem;
	font-size: 0.9em;
}
blockquote.embed .embed-title:hover {
	color: var(--text-color);
	text-decoration: underline;
}
</style>
