import { test, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

test('themes persist, keyboard search works and code is highlighted', async ({ page }) => {
  await page.goto('/commencer/premier-mod')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.hljs-keyword').first()).toBeVisible()
  await page.getByRole('button', { name: 'Thème clair', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Thème clair' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.screenshot({ path: 'test-results/wiki-light.png' })
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('searchbox')).toBeFocused()
  await page.getByRole('searchbox').fill('aucunresultatpossible')
  await expect(page.getByRole('status').filter({ hasText: '0 résultat' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('searchbox')).toHaveValue('')
})

// Capture the exact text a reader copies. A separate local Gradle invocation
// compiles this generated project, not a hidden replacement starter project.
test('tutorial supplies every project file without cloning an example', async ({ page }) => {
  const files = {
    '/commencer/installation': ['settings.gradle.kts', 'build.gradle.kts', 'mod.json'],
    '/commencer/premier-mod': [
      'src/main/kotlin/Entry.kt',
      'assets/mod.txt',
      'assets/closed.svg',
      'assets/open.svg',
    ],
  }
  for (const locale of ['fr', 'en'])
    for (const [route, names] of Object.entries(files)) {
      await page.goto((locale === 'en' ? '/en' : '') + route)
      for (const name of names) {
        const content = await page
          .locator('pre')
          .filter({ has: page.locator('code') })
          .evaluateAll(
            (blocks, title) =>
              blocks.find((b) => b.getAttribute('aria-label') === title)?.textContent,
            name,
          )
        expect(content, name).toBeTruthy()
        expect(content).not.toContain('\\n')
        const path = resolve(
          locale === 'en' ? '.validation/tutorial-project-en' : '.validation/tutorial-project',
          name,
        )
        await mkdir(dirname(path), { recursive: true })
        await writeFile(path, content!, 'utf8')
      }
    }
})

test('navigation, full text search, code copy and unknown route', async ({ page, context }) => {
  const failures: string[] = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text())
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Vos idées. Votre réseau. Vos mods.' }),
  ).toBeVisible()
  await page.screenshot({ path: 'test-results/wiki-desktop.png', fullPage: true })
  await page.getByRole('searchbox').fill('offsetM')
  await page
    .getByRole('navigation', { name: 'Résultats de recherche' })
    .getByRole('link', { name: 'Référence TrackMetric' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'TrackMetric', exact: true, level: 1 }),
  ).toBeVisible()
  await expect(page.getByText('fraction finie dans [0, 1].', { exact: true })).toBeVisible()
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Copier', exact: true }).first().click()
  await expect(page.getByRole('button', { name: 'Copié !', exact: true })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('TrackMetric')
  await page.screenshot({ path: 'test-results/wiki-reference.png', fullPage: true })
  expect(failures).toEqual([])
  const response = await page.goto('/page-inconnue')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Cette voie ne mène nulle part.' })).toBeVisible()
})

test('mobile menu, article links and no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await expect(page.getByRole('searchbox')).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Documentation', exact: true })
    .getByRole('link', { name: 'Votre premier mod' })
    .click()
  await expect(page.getByRole('heading', { name: 'Votre premier mod', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/wiki-mobile.png', fullPage: true })
})

test('English pages, search and language switch preserve the article and section', async ({
  page,
}) => {
  const failures: string[] = []
  page.on('pageerror', (error) => failures.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text())
  })
  await page.goto('/en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your ideas.')
  await page.getByRole('searchbox').fill('preview')
  await page
    .getByRole('navigation', { name: 'Search results' })
    .getByRole('link', { name: /ToolContext/ })
    .click()
  await expect(page).toHaveURL(/\/en\/reference\/toolcontext$/)
  const section = page.locator('.article-section').first()
  const id = await section.getAttribute('id')
  await section.locator('h2 a').click()
  await expect(page.getByRole('link', { name: 'Language', exact: true })).toHaveAttribute(
    'href',
    '/reference/toolcontext#' + id,
  )
  await page.getByRole('link', { name: 'Language', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page).toHaveURL(new RegExp('/reference/toolcontext#' + id + '$'))
  await page.getByRole('link', { name: 'Langue', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('button', { name: 'Copy', exact: true }).first()).toBeVisible()
  await page.screenshot({ path: 'test-results/wiki-english.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/commencer/installation')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Language', exact: true })).toBeVisible()
  expect(failures).toEqual([])
  const unknown = await page.goto('/en/unknown-page')
  expect(unknown?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'This track leads nowhere.' })).toBeVisible()
})
