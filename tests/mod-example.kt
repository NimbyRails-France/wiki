package wiki.tests

import nimby.*
import nimby.mod.*
import wiki.models.*

fun main() {
    val mod = createMod()
    fun aspect(value: Decision) = requireNotNull(mod.indication(value)?.of(firstSignal)).aspect
    check(aspect(mod.evaluate(mapOf("active" to true), Observation())) == Aspect.Closed)
    val clear = Observation(block = Occupancy.Clear, fresh = true, routeKnown = true)
    check(aspect(mod.evaluate(emptyMap(), clear)) == Aspect.Open) // Declared default.
    check(aspect(mod.evaluate(mapOf("active" to false), clear)) == Aspect.Closed)
    check(aspect(mod.decide(Signal(observation = clear, settingsStatus = SettingsStatus.Unavailable), null)!!) == Aspect.Closed)
    check(mod.drivingRule(mod.unknownDecision) == AutomaticDriving.stop())
    check(mod.forcedDecision(Aspect.Open.ordinal) == null) // No permission declared.

    val network = signalMod("network", "Network", Indication(Aspect.Closed, Reason.Unknown)) {
        signal("source", "Source", "source-textures") { rules { next } }
        signal("target", "Target", "target-textures") { rules { Indication(Aspect.Open, Reason.Clear) } }
        images { "signal.svg" }
    }
    val signals = listOf(Signal(id = 1, nextSignal = 2, type = "source"), Signal(id = 2, type = "target"))
    check(network.evaluateNetwork(signals).all { it.aspect == Aspect.Open.ordinal })
    check(network.evaluateNetwork(listOf(signals[0], signals[0].copy(id = 2, nextSignal = 1))).all { it.aspect == Aspect.Closed.ordinal })
    check(runCatching { network.texture(Decision(99, 0), 0, 1) }.isFailure)
    val typed = createNetworkMod()
    val typedSignals = listOf(Signal(1, type = mainSignal.type.id, observation = clear),
        Signal(2, 1, type = distantSignal.type.id, observation = clear))
    val open = typed.evaluateNetwork(typedSignals)
    check(typed.indication(open[1])!!.of(distantSignal)!!.aspect == DistantAspect.Proceed)
    val closed = typed.evaluateNetwork(typedSignals.map { if (it.id == 1L) it.copy(observation = Observation()) else it })
    check(typed.indication(closed[1])!!.of(distantSignal)!!.reason == DistantReason.MainClosed)
    check(typed.indication(open[0])!!.of(distantSignal) == null)
    val missing = typed.evaluateNetwork(listOf(typedSignals[1]))
    check(typed.indication(missing[0])!!.of(distantSignal)!!.reason == DistantReason.Unknown)
    println("PASS: wiki examples, model-local enums, neighbour policy, defaults, unavailable settings, permissions, cycles and invalid codes")
}
