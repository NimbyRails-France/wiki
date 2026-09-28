import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadContent, readableStrings } from '../scripts/content-loader.mjs'

const { articlesFor, translate, localePath, basePath, routeLocale } = loadContent(
  'app/content/localization.ts',
)
const french = articlesFor('fr'),
  english = articlesFor('en')
test('every article, section and readable block has a complete English counterpart', () => {
  assert.equal(french.length, english.length)
  assert(french.length >= 30)
  for (const text of readableStrings(french)) assert(translate(text, 'en').length)
  for (let i = 0; i < french.length; i++) {
    const a = french[i],
      b = english[i]
    assert.equal(a.slug, b.slug)
    assert.equal(a.status, b.status)
    assert.equal(a.sections.length, b.sections.length)
    for (let j = 0; j < a.sections.length; j++) {
      assert.equal(a.sections[j].id, b.sections[j].id)
      assert.equal(a.sections[j].blocks.length, b.sections[j].blocks.length)
      for (const block of b.sections[j].blocks)
        if (block.kind === 'links') {
          for (const item of block.items)
            if (item.to.startsWith('/')) assert(item.to.startsWith('/en/'))
        }
    }
  }
  assert.throws(() => translate('Untranslated future content', 'en'), /Missing English translation/)
})
test('localized paths preserve external links and fragments without duplicate prefixes', () => {
  assert.equal(localePath('/mods/signaux#voisin', 'en'), '/en/mods/signaux#voisin')
  assert.equal(localePath('/en/mods/signaux#voisin', 'fr'), '/mods/signaux#voisin')
  assert.equal(localePath('/en', 'en'), '/en')
  assert.equal(localePath('/', 'en'), '/en')
  assert.equal(basePath('/enough'), '/enough')
  assert.equal(routeLocale('/enough'), 'fr')
  assert.equal(
    localePath('https://github.com/NimbyRails-France/signal-placement', 'en'),
    'https://github.com/NimbyRails-France/signal-placement',
  )
  assert.equal(localePath('#local-anchor', 'en'), '#local-anchor')
})

test('the translation guide preserves both languages in its downloadable JSON example', () => {
  const guide = english.find((article) => article.slug === 'mods/traductions')
  const example = guide.sections
    .flatMap((section) => section.blocks)
    .find((block) => block.kind === 'code' && block.language === 'json')
  const catalogue = JSON.parse(example.code)
  assert.equal(catalogue.fallback, 'en')
  assert.equal(catalogue.languages.fr.repeat, 'Répéter')
  assert.equal(catalogue.languages.en.repeat, 'Repeat')
})
