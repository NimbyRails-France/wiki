package wiki.approach

import nimby.*

enum class ApproachAspect { Closed, Open }
enum class ApproachReason { Unknown, TrainApproaching }

val approachSignal = signalModel(
    "monmod.approche", "Signal à l’approche", "textures_approche",
    fallback = Indication(ApproachAspect.Closed, ApproachReason.Unknown)
) {
    construction(states = listOf("closed.svg", "open.svg"))
    observeApproach(blocks = 2)
    rules {
        if (fresh && routeKnown && block == Occupancy.Clear && trainApproaching &&
            !observation.forcedStop && !observation.lampFailed)
            Indication(ApproachAspect.Open, ApproachReason.TrainApproaching)
        else Indication(ApproachAspect.Closed, ApproachReason.Unknown)
    }
    images { if (it.aspect == ApproachAspect.Open) "open.svg" else "closed.svg" }
    // Le mod choisit ici sa politique de conduite.
    driving { if (it.aspect == ApproachAspect.Open) AutomaticDriving.clear() else AutomaticDriving.stop() }
}
