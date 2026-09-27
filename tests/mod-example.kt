package wiki.tests

import nimby.*
import nimby.mod.*

fun main() {
    val mod = createMod()
    check(mod.evaluate(mapOf("active" to true), Observation()).aspect == Aspect.Closed.ordinal)
    val clear = Observation(block = Occupancy.Clear, fresh = true, routeKnown = true)
    check(mod.evaluate(emptyMap(), clear).aspect == Aspect.Open.ordinal) // Declared default.
    check(mod.evaluate(mapOf("active" to false), clear).aspect == Aspect.Closed.ordinal)
    check(mod.decide(Signal(observation = clear, settingsStatus = SettingsStatus.Unavailable), null)?.aspect == Aspect.Closed.ordinal)
    check(mod.drivingRule(Decision(Aspect.Closed.ordinal, Reason.Unknown.ordinal)) == AutomaticDriving.stop())
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
    println("PASS: wiki example, defaults, unavailable settings, permissions, mixed network, cycle and invalid codes")
}
