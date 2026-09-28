package wiki.blinking

import nimby.*

enum class BlinkAspect { Closed, Flashing }
enum class BlinkReason { Unknown, Clear }

private val closedImage = steady("closed.svg")
private val flashingImage = blink(on = "on.svg", off = "off.svg", everyMs = 250)

val blinkingSignal = signalModel(
    "monmod.clignotant", "Signal clignotant", "textures_clignotantes",
    fallback = Indication(BlinkAspect.Closed, BlinkReason.Unknown)
) {
    construction(states = listOf("closed.svg", "on.svg", "off.svg"))
    rules {
        if (fresh && routeKnown && block == Occupancy.Clear &&
            !observation.forcedStop && !observation.lampFailed)
            Indication(BlinkAspect.Flashing, BlinkReason.Clear)
        else Indication(BlinkAspect.Closed, BlinkReason.Unknown)
    }
    appearance { if (it.aspect == BlinkAspect.Flashing) flashingImage else closedImage }
    // Le clignotement ne donne pas de permission : ce modèle exige toujours l'arrêt.
    driving { AutomaticDriving.stop() }
}
