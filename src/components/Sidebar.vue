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
    <nav id="sidebar" :class="{expanded: sidebarExpanded}">
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
    </nav>
    <header>
        <button id="navbar-button-left" class="navbar-button" @click="sidebarExpanded = !sidebarExpanded"><Bars3Icon/></button>
        <a href="/">
            <h1 id="app-title">Tessam Wiki</h1>
        </a>
        <button id="navbar-button-right" class="navbar-button" @click="sidebarExpanded = !sidebarExpanded"><Bars3Icon/></button>
    </header>
</template>
<style lang="css" scoped>
@media screen and (min-width: 600px) {
    nav#sidebar {
        left: -100%;
        top: 0;
        padding: 40px 0.5rem 1rem 0.5rem;

        transition: left 100ms linear;

        &.expanded {
            left: 0;
        }
    }
}
@media screen and (max-width: 600px) {
    nav#sidebar {
        display: flex;
        flex-direction: column;
        justify-content: end;
        padding-bottom: 2rem;

        bottom: -100vh;
        left: 0;
        
        transition: bottom 200ms linear;

        &.expanded {
            bottom: 0;
        }
    }
}
header {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 33px;
    width: 100vw;
    display: flex;
    justify-content: center;

    button.navbar-button {
        all: unset;
        z-index: 5;
        top: 0;
        cursor: pointer;
        color: white;
        position: absolute;
        svg {
            height: 33px;
            width: 33px;
        }
    }
    button#navbar-button-left {
        left: 0;
    }
    button#navbar-button-right {
        right: 0;
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
    width: 100%;
    height: 100%;
    opacity: 80%;
    overflow-y: auto;
    background: #131212;
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
</style>