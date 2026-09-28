export default defineNuxtConfig({
  compatibilityDate: '2026-09-27',
  devtools: { enabled: false },
  css: ['~/assets/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Wiki — NimbyRails France',
      meta: [{ name: 'theme-color', content: '#111216' }],
      script: [{ src: '/theme.js' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  nitro: { prerender: { crawlLinks: true, failOnError: true, routes: ['/', '/en'] } },
  typescript: { strict: true },
})
