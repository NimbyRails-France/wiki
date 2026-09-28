import {
  articlesFor,
  groupsFor,
  translate,
  routeLocale,
  basePath,
  localePath,
} from '~/content/localization'

export function useWikiLocale() {
  const route = useRoute()
  const locale = computed(() => routeLocale(route.path))
  const path = (value: string) => localePath(value, locale.value)
  const t = (value: string) => translate(value, locale.value)
  const articles = computed(() => articlesFor(locale.value))
  const groups = computed(() => groupsFor(locale.value))
  // Hash is kept only client-side to avoid hydration differences: browsers do
  // not send fragments to the server. The link is updated after mounting.
  const fragment = ref('')
  onMounted(() => {
    fragment.value = route.hash
  })
  watch(
    () => route.hash,
    (hash) => {
      fragment.value = hash
    },
  )
  const alternate = computed(
    () => localePath(basePath(route.path), locale.value === 'en' ? 'fr' : 'en') + fragment.value,
  )
  return { locale, path, t, articles, groups, alternate }
}

export function useWikiHead() {
  const route = useRoute()
  useHead(() => ({
    htmlAttrs: { lang: routeLocale(route.path) },
    link: [
      {
        rel: 'canonical',
        href: 'https://wiki.nimbyrails-france.fr' + localePath(route.path, routeLocale(route.path)),
      },
      ...(['fr', 'en'] as const).map((locale) => ({
        rel: 'alternate' as const,
        type: 'text/html',
        hreflang: locale,
        href: 'https://wiki.nimbyrails-france.fr' + localePath(route.path, locale),
      })),
      {
        rel: 'alternate',
        type: 'text/html',
        hreflang: 'x-default',
        href: 'https://wiki.nimbyrails-france.fr' + basePath(route.path),
      },
    ],
  }))
}
