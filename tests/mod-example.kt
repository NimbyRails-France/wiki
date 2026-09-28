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
    val policy=wiki.driving.instruction(wiki.driving.Aspect.Warning,wiki.driving.Speeds(25.0,12.0))
    check(policy.signalsAhead==1 && policy.reopenedSpeedMps==25.0/3.6)
    check(DrivingFlag.ApproachPassable in policy.flags)
    check(runCatching { wiki.driving.Speeds(Double.NaN,12.0) }.isFailure)
    val track=0x1000000000001L;val source=0x8000000000001L
    val captured=ToolNetwork("world",1,listOf(ToolTrack(track,null,null,500.0)),emptyList(),listOf(ToolSignal(source,track,.1,-1,4)))
    check(wiki.preview.previewPositions(captured,source,3)==listOf(.25,.5,.75).map { SignalPosition(track,it,-1) })
    check(wiki.preview.previewPositions(captured,source,64).let { it.size==64 && it.distinct().size==64 && it.all { p -> p.fraction>0 && p.fraction<1 } })
    check(runCatching { wiki.preview.previewPositions(captured,source,0) }.isFailure)
    check(runCatching { wiki.preview.previewPositions(captured,source,65) }.isFailure)
    check(runCatching { wiki.preview.previewPositions(captured,source+1,3) }.isFailure)
    check(wiki.preview.createPreviewTool().services==listOf("preview.v1"))
    check(wiki.translations.createTranslatedTool().services==listOf("message.v1"))
    check(wiki.translations.maintenance.name=="maintenance")
    check(wiki.translations.summary(1)!=wiki.translations.summary(3))
    println("PASS: wiki examples, model-local enums, neighbour policy, defaults, unavailable settings, permissions, cycles and invalid codes")
}
