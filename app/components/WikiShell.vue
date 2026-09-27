<script setup lang="ts">
import { articles, groups } from '~/content'
const query = ref('')
const menuOpen = ref(false)
const search = ref<HTMLInputElement>()
const menuButton = ref<HTMLButtonElement>()
const theme = ref('dark')
const route = useRoute()
const closeMenu = () => {
  menuOpen.value = false
  menuButton.value?.focus()
}
watch(
  () => route.path,
  () => {
    menuOpen.value = false
    query.value = ''
  },
)
function setTheme(value: string) {
  theme.value = value
  document.documentElement.dataset.theme = value
  try {
    localStorage.setItem('nrf-wiki-theme', value)
  } catch {}
}
function shortcuts(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    menuOpen.value = true
    nextTick(() => search.value?.focus())
  }
  if (event.key === 'Escape') {
    query.value = ''
    closeMenu()
  }
}
onMounted(() => {
  theme.value = document.documentElement.dataset.theme || 'dark'
  window.addEventListener('keydown', shortcuts)
})
onUnmounted(() => window.removeEventListener('keydown', shortcuts))
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const results = computed(() => {
  const terms = normalize(query.value).trim().split(/\s+/).filter(Boolean)
  return terms.length
    ? articles.filter((a) => terms.every((t) => normalize(JSON.stringify(a)).includes(t)))
    : []
})
</script>
<template>
  <a class="skip-link" href="#main">Aller au contenu</a>
  <header class="mobile-header">
    <NuxtLink class="brand" to="/"
      ><img src="/favicon.svg" alt="" width="28" height="28" />NRF <strong>Guide</strong></NuxtLink
    >
    <button
      ref="menuButton"
      class="mobile-menu"
      :aria-expanded="menuOpen"
      aria-controls="wiki-navigation"
      @click="menuOpen = !menuOpen"
    >
      {{ menuOpen ? 'Fermer' : 'Menu' }}
    </button>
  </header>
  <button
    v-if="menuOpen"
    class="menu-backdrop"
    aria-label="Fermer la navigation"
    @click="closeMenu"
  />
  <div class="wiki-layout">
    <aside id="wiki-navigation" class="sidebar" :class="{ open: menuOpen }">
      <NuxtLink class="brand sidebar-brand" to="/" aria-label="NimbyRails France — accueil du wiki">
        <img src="/favicon.svg" alt="" width="34" height="34" />
        <span>NimbyRails <strong>France</strong><small>LE GUIDE DES CRÉATEURS</small></span>
      </NuxtLink>
      <form class="search-form" role="search" @submit.prevent>
        <label for="wiki-search" class="sr-only">Rechercher dans le wiki</label>
        <div class="search-input">
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="6.5" />
            <path d="m15 15 5 5" />
          </svg>
          <input
            id="wiki-search"
            ref="search"
            v-model="query"
            type="search"
            placeholder="Rechercher…"
            autocomplete="off"
          />
          <kbd aria-hidden="true">Ctrl K</kbd>
        </div>
      </form>
      <NuxtLink class="edition" to="/commencer/bienvenue"
        ><span class="book-icon" aria-hidden="true">▤</span
        ><span>Documentation Kotlin<small>SDK 0.8 · Windows</small></span
        ><span aria-hidden="true">⌄</span></NuxtLink
      >
      <div class="sidebar-scroll">
        <nav v-if="query.trim()" aria-label="Résultats de recherche" class="search-results">
          <p role="status">{{ results.length }} résultat{{ results.length > 1 ? 's' : '' }}</p>
          <NuxtLink v-for="article in results" :key="article.slug" :to="'/' + article.slug"
            ><small>{{ article.group }}</small
            >{{ article.title }}</NuxtLink
          >
          <p v-if="!results.length">Essayez « signal », « horloge » ou « TrackMetric ».</p>
        </nav>
        <nav v-else aria-label="Documentation">
          <NuxtLink class="nav-home" to="/"
            ><span aria-hidden="true">⌂</span> Vue d’ensemble</NuxtLink
          >
          <section v-for="group in groups" :key="group" class="nav-group">
            <h2>{{ group }}</h2>
            <NuxtLink
              v-for="article in articles.filter((a) => a.group === group)"
              :key="article.slug"
              :to="'/' + article.slug"
            >
              {{ article.title
              }}<span
                v-if="article.status === 'experimental'"
                class="experimental-dot"
                title="Expérimental"
                aria-label="Expérimental"
              />
            </NuxtLink>
          </section>
        </nav>
      </div>
      <div class="sidebar-footer">
        <a href="https://github.com/NimbyRails-France/wiki" class="github-link"
          >GitHub <span aria-hidden="true">↗</span></a
        >
        <div class="theme-switch" role="group" aria-label="Apparence">
          <button
            aria-label="Thème clair"
            :aria-pressed="theme === 'light'"
            @click="setTheme('light')"
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"
              />
            </svg>
          </button>
          <button
            aria-label="Thème sombre"
            :aria-pressed="theme === 'dark'"
            @click="setTheme('dark')"
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
    <div class="main-column">
      <main id="main" tabindex="-1"><slot /></main>
      <footer class="site-footer">
        <span>Le wiki officiel des créateurs de mods.</span
        ><a href="https://nimbyrails-france.fr/">NimbyRails France ↗</a>
      </footer>
    </div>
  </div>
</template>
