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
const sidebarExpanded = ref(window.innerWidth > 900)

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

function closeSidebarOnMobile() {
    if (window.innerWidth <= 900) sidebarExpanded.value = false
}

defineExpose({ searchQuery, sidebarExpanded })
</script>
<template>
    <nav id="sidebar" :class="{expanded: sidebarExpanded}">
        <SearchResults
            v-if="searchQuery.trim()"
            :results="searchResults"
            @select="() => {
                searchQuery = ''
                closeSidebarOnMobile()
            }"
        />
        <template v-else>
            <div id="content">
                <div id="tree">
                    <div class="section-title">Files</div>
                    <SidebarTree :nodes="tree" @select="closeSidebarOnMobile"  />
                </div>
                <RecentFiles :files="recentFiles" @select="closeSidebarOnMobile" />
            </div>
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
<style lang="css">
@media screen and (min-width: 900px) {
    header {
        justify-content: start;
        padding-left: 2rem;

        button#navbar-button-right {
            display: none;
        }

        a {
            h1#app-title {
                font-size: 1.6rem;
            }
        }
    }
    nav#sidebar {
        display: flex;
        flex-direction: column-reverse;
        justify-content: start;
        left: -20%;

        top: 0;
        width: 20%;
        max-width: 300px;
        padding: 40px 0.5rem 1rem 0.5rem;

        transition: left 100ms linear;

        &.expanded {
            left: 0;
        }
    }
}
@media screen and (max-width: 900px) {
    header {
        position: absolute;
        left: 0;
        bottom: 0;
        justify-content: center;

        button#navbar-button-right {
            right: 0;
        }

        a {
            h1#app-title {
                font-size: 1.4rem;
            }
        }
    }
    nav#sidebar {
        display: flex;
        flex-direction: column;
        justify-content: end;
        width: 100%;
        height: 100dvh;
        padding-bottom: 2rem;

        bottom: -100dvh;
        left: 0;

        transition: bottom 200ms linear;

        &.expanded {
            bottom: 0;
        }
    }
}
header {
    height: 33px;
    width: 100vw;
    display: flex;
    a {
        z-index: 5;
        text-decoration: none;

        h1#app-title {
            width: fit-content;
            text-align: center;
            color: var(--bg-surface);
        }
    }

    button.navbar-button {
        all: unset;
        z-index: 5;
        top: 0;
        cursor: pointer;
        color: var(--bg-surface);
        position: absolute;
        svg {
            height: 33px;
            width: 33px;
        }
    }
    button#navbar-button-left {
        left: 0;
    }
}
nav#sidebar {
    z-index: 4;
    position: absolute;
    height: 100%;
    opacity: 90%;
    overflow-y: auto;
    background: var(--bg-base);
    gap: 1rem;

    #content {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 1rem;

        #tree {
            max-height: 50vh;
            overflow-y: auto;
        }
    }

    .section-title {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--text-muted);
        padding: 0 0.5rem 0.4rem;
    }
}
#search-box { padding: 0 0.5rem 0.6rem; }
#search-input {
    width: 100%;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--border-default);
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.85rem;
    background: var(--bg-surface);
    color: var(--text-dark);
    outline: none;
}
</style>