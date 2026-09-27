import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { resolve, relative, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { declarations } from './kotlin-api.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sdkArg = process.argv.indexOf('--sdk')
const sdk = resolve(sdkArg >= 0 ? process.argv[sdkArg + 1] : resolve(root, '../sdk'))
const scopes = [
  { directory: 'kotlin/src/nimby', runtime: 'Kotlin/Native', package: 'nimby' },
  {
    directory: 'kotlin-client/src/main/kotlin/fr/nimby/sdk',
    runtime: 'Kotlin/JVM',
    package: 'fr.nimby.sdk',
  },
]
const files = []
for (const scope of scopes) {
  for (const name of (await readdir(resolve(sdk, scope.directory)))
    .filter((n) => n.endsWith('.kt'))
    .sort()) {
    const path = resolve(sdk, scope.directory, name)
    const source = (await readFile(path, 'utf8')).replace(/\r\n/g, '\n')
    const symbols = declarations(source)
    if (!symbols.length) continue
    files.push({
      file: name,
      path: relative(sdk, path).replaceAll('\\', '/'),
      runtime: scope.runtime,
      package: scope.package,
      sha256: createHash('sha256').update(source).digest('hex'),
      symbols,
    })
  }
}
const result = { sdkVersion: (await readFile(resolve(sdk, 'VERSION'), 'utf8')).trim(), files }
const destination = resolve(root, 'app/content/generated/api.json')
const encoded = JSON.stringify(result, null, 2) + '\n'
if (process.argv.includes('--check')) {
  if ((await readFile(destination, 'utf8')) !== encoded)
    throw new Error('Référence désynchronisée : lancer npm run api:sync puis relire le diff.')
  console.log('Référence identique aux sources Kotlin.')
} else {
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, encoded)
  console.log(
    `${files.length} fichiers publics, ${files.reduce((n, f) => n + f.symbols.length, 0)} déclarations synchronisées.`,
  )
}
