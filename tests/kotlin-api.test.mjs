import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { declarations } from '../scripts/kotlin-api.mjs'

test('constructor properties are included once; internal scopes stay hidden', () => {
  const symbols = declarations(`
internal data class Secret(
    val token: String
)
/** Public values. */
data class Public(
    val speed: Double,
    val position: Long?
) {
    private fun hidden() { fun local() {} }
    /** Measured distance. */
    fun distance(scale: Double): Double = speed * scale
}
`)
  assert.deepEqual(
    symbols.map((s) => s.name),
    ['Public', 'distance'],
  )
  assert.match(symbols[0].signature, /val position: Long\?/)
  assert.equal(symbols[1].owner, 'Public')
  assert.equal(symbols[1].documentation, 'Measured distance.')
})

test('typed DSL function name survives nested generic bounds', () => {
  const [symbol] = declarations(
    'inline fun <reified A : Enum<A>, reified R : Enum<R>> signalMod(\n    fallback: Pair<A, R>\n): Mod = create(fallback)',
  )
  assert.equal(symbol.name, 'signalMod')
  assert.match(symbol.signature, /fallback: Pair<A, R>/)
})

test('internal constructors hide transport parameters but preserve public properties', () => {
  const symbols = declarations(`class Context @PublishedApi internal constructor(
    val world: String, override val generation: Long,
    private val native: (Int, List<Pair<Long, Int>>) -> Int,
) {
  fun close() {}
}`)
  assert.equal(symbols[0].signature, 'class Context')
  assert.deepEqual(
    symbols.slice(1).map((s) => s.name),
    ['world', 'generation', 'close'],
  )
  assert(symbols.slice(1).every((s) => s.owner === 'Context'))
  assert(!JSON.stringify(symbols).includes('private val native'))
})

test('snapshot covers the two SDK surfaces without native internals', async () => {
  const snapshot = JSON.parse(
    await readFile(new URL('../app/content/generated/api.json', import.meta.url), 'utf8'),
  )
  assert(snapshot.files.length >= 12)
  assert(snapshot.files.every((f) => f.symbols.length && f.sha256.length === 64))
  const names = snapshot.files.flatMap((f) => f.symbols.map((s) => s.name))
  for (const required of [
    'signalMod',
    'Indication',
    'NimbyClient',
    'readTrain',
    'SimulationClock',
    'TrackMetric',
    'AutomaticDriving',
    'ConstructionResult',
    'ModControlSession',
  ])
    assert(names.includes(required), required)
  for (const hidden of [
    'CompiledSignal',
    'LibraryLease',
    'Libraries',
    'ConstructionCodec',
    'buildSignalMod',
  ])
    assert(!names.includes(hidden), hidden)
})
