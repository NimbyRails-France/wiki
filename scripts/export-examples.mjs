import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadContent } from './content-loader.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { englishCode } = loadContent(resolve(root, 'app/content/localization.ts'))
const output = resolve(root, '.validation/example-check/en')
mkdirSync(output, { recursive: true })
for (const name of readdirSync(resolve(root, 'app/content/snippets')).filter((name) =>
  name.endsWith('.kt'),
)) {
  writeFileSync(
    resolve(output, name),
    englishCode(readFileSync(resolve(root, 'app/content/snippets', name), 'utf8')),
  )
}
