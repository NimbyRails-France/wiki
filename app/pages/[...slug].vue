<script setup lang="ts">
import { articles } from '~/content'
import { basePath } from '~/content/localization'
definePageMeta({
  validate: (route) =>
    articles.some((a) => a.slug === basePath(route.path).replace(/^\/|\/$/g, '')),
})
const route = useRoute()
const { articles: localizedArticles, path, t } = useWikiLocale()
const slug = computed(() => basePath(route.path).replace(/^\/|\/$/g, ''))
const article = computed(() => localizedArticles.value.find((a) => a.slug === slug.value))
if (!article.value) throw createError({ statusCode: 404, statusMessage: t('Page introuvable') })
const position = computed(() => localizedArticles.value.findIndex((a) => a.slug === slug.value))
const previous = computed(() => localizedArticles.value[position.value - 1])
const next = computed(() => localizedArticles.value[position.value + 1])
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
</script>
<template>
  <WikiShell v-if="article">
    <div class="article-layout">
      <article class="article">
        <div class="breadcrumbs">
          <NuxtLink :to="path('/')">Wiki</NuxtLink><span>/</span><span>{{ article.group }}</span>
        </div>
        <p class="eyebrow">{{ article.group }}</p>
        <h1>{{ article.title }}</h1>
        <p class="article-lead">{{ article.description }}</p>
        <aside v-if="article.status" class="note">
          <strong>{{
            t(article.status === 'experimental' ? 'Fonction expérimentale' : 'API en développement')
          }}</strong>
          <p>
            {{
              t(
                article.status === 'experimental'
                  ? 'Cette fonction demande une qualification spécifique. Sa présence dans la référence ne signifie pas qu’elle est disponible dans le kit distribué.'
                  : 'Cette page suit le code de développement du SDK 0.8. Utilisez un kit construit depuis la même révision.',
              )
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
          <a href="https://github.com/NimbyRails-France/wiki/issues/new">{{
            t('Signaler une erreur dans cette page ↗')
          }}</a
          ><span>Windows · SDK 0.8</span>
        </div>
        <nav class="page-navigation" :aria-label="t('Parcours du wiki')">
          <NuxtLink v-if="previous" :to="path('/' + previous.slug)"
            ><small>{{ t('← PRÉCÉDENT') }}</small
            >{{ previous.title }}</NuxtLink
          ><NuxtLink v-if="next" :to="path('/' + next.slug)"
            ><small>{{ t('SUIVANT →') }}</small
            >{{ next.title }}</NuxtLink
          >
        </nav>
      </article>
      <aside class="table-of-contents">
        <p>{{ t('Sur cette page') }}</p>
        <a
          v-for="section in article.sections"
          :key="section.id"
          :href="'#' + section.id"
          :aria-current="activeSection === section.id ? 'location' : undefined"
          >{{ section.title }}</a
        >
        <div class="toc-note">
          {{ t('Une question sur le SDK ?') }}
          <NuxtLink :to="path('/reference')">{{ t('Explorer les types Kotlin ↗') }}</NuxtLink>
        </div>
      </aside>
    </div>
  </WikiShell>
</template>
