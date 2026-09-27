<script setup lang="ts">
import { articles } from '~/content'
definePageMeta({
  validate: (route) =>
    articles.some(
      (a) =>
        a.slug ===
        (Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug),
    ),
})
const route = useRoute()
const slug = computed(() =>
  Array.isArray(route.params.slug) ? route.params.slug.join('/') : String(route.params.slug || ''),
)
const article = computed(() => articles.find((a) => a.slug === slug.value))
if (!article.value) throw createError({ statusCode: 404, statusMessage: 'Page introuvable' })
const position = computed(() => articles.findIndex((a) => a.slug === slug.value))
const previous = computed(() => articles[position.value - 1])
const next = computed(() => articles[position.value + 1])
const activeSection = ref('')
function updateSection() {
  const sections = article.value?.sections || []
  activeSection.value = sections[0]?.id || ''
  for (const section of sections) {
    if ((document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) <= 140)
      activeSection.value = section.id
  }
}
onMounted(() => {
  updateSection()
  window.addEventListener('scroll', updateSection, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', updateSection))
watch(slug, () => nextTick(updateSection))
useSeoMeta({
  title: () => `${article.value?.title} — Wiki NimbyRails France`,
  description: () => article.value?.description,
})
useHead(() => ({
  link: [{ rel: 'canonical', href: `https://wiki.nimbyrails-france.fr/${slug.value}` }],
}))
</script>
<template>
  <WikiShell v-if="article">
    <div class="article-layout">
      <article class="article">
        <div class="breadcrumbs">
          <NuxtLink to="/">Wiki</NuxtLink><span>/</span><span>{{ article.group }}</span>
        </div>
        <p class="eyebrow">{{ article.group }}</p>
        <h1>{{ article.title }}</h1>
        <p class="article-lead">{{ article.description }}</p>
        <aside v-if="article.status" class="note">
          <strong>{{
            article.status === 'experimental' ? 'Fonction expérimentale' : 'API en développement'
          }}</strong>
          <p>
            {{
              article.status === 'experimental'
                ? 'Cette fonction demande une qualification spécifique. Sa présence dans la référence ne signifie pas qu’elle est disponible dans le kit distribué.'
                : 'Cette page suit le code de développement du SDK 0.8. Utilisez un kit construit depuis la même révision.'
            }}
          </p>
        </aside>
        <section
          v-for="section in article.sections"
          :id="section.id"
          :key="section.id"
          class="article-section"
        >
          <h2>
            <a :href="'#' + section.id">{{ section.title }}<span aria-hidden="true"> #</span></a>
          </h2>
          <ArticleBlocks :blocks="section.blocks" />
        </section>
        <div class="article-meta">
          <a href="https://github.com/NimbyRails-France/wiki/issues/new"
            >Signaler une erreur dans cette page ↗</a
          ><span>Windows · SDK 0.8</span>
        </div>
        <nav class="page-navigation" aria-label="Parcours du wiki">
          <NuxtLink v-if="previous" :to="'/' + previous.slug"
            ><small>← PRÉCÉDENT</small>{{ previous.title }}</NuxtLink
          ><NuxtLink v-if="next" :to="'/' + next.slug"
            ><small>SUIVANT →</small>{{ next.title }}</NuxtLink
          >
        </nav>
      </article>
      <aside class="table-of-contents">
        <p>Sur cette page</p>
        <a
          v-for="section in article.sections"
          :key="section.id"
          :href="'#' + section.id"
          :aria-current="activeSection === section.id ? 'location' : undefined"
          >{{ section.title }}</a
        >
        <div class="toc-note">
          Une question sur le SDK ?
          <NuxtLink to="/reference">Explorer les types Kotlin ↗</NuxtLink>
        </div>
      </aside>
    </div>
  </WikiShell>
</template>
