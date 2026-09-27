import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const root = resolve('.output/public')
async function walk(path) {
  const entries = await readdir(path, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? walk(resolve(path, entry.name)) : resolve(path, entry.name),
      ),
    )
  ).flat()
}
const files = (await walk(root)).filter((p) => p.endsWith('.html'))
const documents = new Map(
  await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])),
)
let links = 0
for (const [file, html] of documents) {
  if (file === resolve(root, '200.html') || file === resolve(root, '404.html')) continue
  assert.match(html, /<html[^>]+lang="fr"/, file)
  assert.match(html, /<h1\b/, file)
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^" ]+)"/g)) {
    if (
      (!href.startsWith('/') && !href.startsWith('#')) ||
      href.startsWith('//') ||
      href.startsWith('/_nuxt/') ||
      href === '/favicon.svg'
    )
      continue
    const [path, hash] = href.split('#')
    const target = path ? resolve(root, '.' + path, 'index.html') : file
    const targetHtml = documents.get(target)
    assert(targetHtml, `Lien interne absent : ${file} → ${href}`)
    if (hash) assert(targetHtml.includes(`id="${hash}"`), `Ancre absente : ${file} → ${href}`)
    links++
  }
}
console.log(`${files.length - 2} pages HTML et ${links} liens/ancres internes vérifiés.`)
