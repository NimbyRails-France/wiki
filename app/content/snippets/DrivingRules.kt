package wiki.driving

import nimby.*

enum class Aspect { Closed, Warning, Restricted, Open }

// These values are policy chosen by this fictional mod, never SDK defaults.
data class Speeds(val passageKmh: Double, val restrictedKmh: Double) {
    init {
        require(passageKmh.isFinite() && passageKmh > 0)
        require(restrictedKmh.isFinite() && restrictedKmh > 0)
    }
}

fun instruction(aspect: Aspect, speeds: Speeds): DrivingRule = when (aspect) {
    Aspect.Closed -> AutomaticDriving.stop()
    Aspect.Warning -> AutomaticDriving.announceStop(
        signalsAhead = 1,
        passageSpeedMps = speeds.passageKmh / 3.6,
        passableHere = true,
        followTargetSpeed = true
    )
    Aspect.Restricted -> AutomaticDriving.restrictedUntilNextSignal(
        entrySpeedMps = speeds.restrictedKmh / 3.6,
        maximumSpeedMps = speeds.restrictedKmh / 3.6,
        stopFirst = false
    )
    Aspect.Open -> AutomaticDriving.clear()
}

// In your signalModel builder:
// driving { indication -> instruction(indication.aspect, Speeds(25.0, 12.0)) }
// The model must use this Aspect enum; its Reason enum remains its own.
