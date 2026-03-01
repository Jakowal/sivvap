<script setup lang="ts">
import { ref, watch } from 'vue'
import { processVaultFiles } from '../utils/vault'
import { searchFiles } from '../utils/search'
import vaultDates from 'virtual:vault-dates'
import SidebarTree from '../components/SidebarTree.vue'
import SearchResults from '../components/SearchResults.vue'
import RecentFiles from '../components/RecentFiles.vue'
import { VaultFile } from '../types'
import { Bars3Icon } from '@heroicons/vue/24/outline'


// Bundle all vault markdown files as raw strings at build time
const rawFiles = import.meta.glob('/Vault/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>

const { tree, files } = processVaultFiles(rawFiles, vaultDates)
const sidebarExpanded = ref(false)

const recentFiles = Object.values(files)
    .filter((f): f is VaultFile & { lastUpdated: string } => f.lastUpdated !== null)
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 10)

const searchQuery = ref('')
const searchResults = ref<{ path: string; title: string; excerpt: string }[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

// Debounce search so it doesn't run on every keystroke
watch(searchQuery, (q) => {
    if (searchTimer) clearTimeout(searchTimer)
    if (!q.trim()) { searchResults.value = []; return }
    searchTimer = setTimeout(() => {
    searchResults.value = searchFiles(files, q)
    }, 200)
})
</script>
<template>
    <header>
        <button id="navbar-button" @click="sidebarExpanded = !sidebarExpanded"><Bars3Icon/></button>
        <a href="/">
            <h1 id="app-title">Tessam Wiki</h1>
        </a>
        <nav id="sidebar" :class="{expanded: sidebarExpanded}">
            <div id="search-box">
                <input
                    v-model="searchQuery"
                    id="search-input"
                    type="search"
                    placeholder="Search…"
                    autocomplete="off"
                    spellcheck="false"
                />
            </div>
            <SearchResults
                v-if="searchQuery.trim()"
                :results="searchResults"
                @select="() => {
                    searchQuery = ''
                    sidebarExpanded = false
                }"
            />
            <template v-else>
                <SidebarTree :nodes="tree" @select="sidebarExpanded = false"  />
                <RecentFiles :files="recentFiles" @select="sidebarExpanded = false" />
            </template>
        </nav>
    </header>
</template>
<style lang="css" scoped>
header {
    width: 100%;
    display: flex;
    justify-content: center;

    button#navbar-button {
        all: unset;
        z-index: 5;
        left: 0;
        top: 0;
        cursor: pointer;
        color: white;
        position: absolute;   
        svg {
        height: 33px;
        width: 33px;
        }
    }
    a {
        z-index: 5;
    text-decoration: none;

        h1#app-title {
            width: fit-content;
            text-align: center;
            color: white;
        }
    }
}
nav#sidebar {
    z-index: 4;
    position: absolute;
    left: -100%;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 80%;
    overflow-y: auto;
    padding: 40px 0.5rem 1rem 0.5rem;
    background: #131212;

    transition: left 100ms linear;

    &.expanded {
    left: 0;
    }
}
#sidebar-title {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #df98ea;
    padding: 0 0.5rem 0.75rem;
}
#search-box { padding: 0 0.5rem 0.6rem; }
#search-input {
    width: 100%;
    padding: 0.35rem 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.85rem;
    background: #fff;
    color: #1a1a1a;
    outline: none;
}
#search-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px #dbeafe; }

</style>