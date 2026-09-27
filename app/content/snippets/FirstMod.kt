package nimby.mod

import nimby.*

// Les noms décrivent vos indications, pas des codes natifs.
enum class Aspect { Closed, Open }
enum class Reason { Unknown, Disabled, Occupied, Clear }

fun createMod(): SignallingMod = signalMod(
    id = "mon-premier-mod",
    title = "Mon premier signal",
    fallback = Indication(Aspect.Closed, Reason.Unknown)
) {
    signal("monmod.signal", "Mon premier signal", "mon_premier_signal") {
        val active = checkbox("active", "Activer le signal", defaultValue = true)

        rules {
            when {
                settingsStatus == SettingsStatus.Unavailable -> Indication(Aspect.Closed, Reason.Unknown)
                !enabled(active) -> Indication(Aspect.Closed, Reason.Disabled)
                !fresh || !routeKnown || observation.lampFailed || observation.forcedStop ->
                    Indication(Aspect.Closed, Reason.Unknown)
                block == Occupancy.Clear -> Indication(Aspect.Open, Reason.Clear)
                block == Occupancy.Occupied -> Indication(Aspect.Closed, Reason.Occupied)
                else -> Indication(Aspect.Closed, Reason.Unknown)
            }
        }
    }

    // Les deux fichiers SVG sont déclarés dans assets/mod.txt.
    images { indication ->
        when (indication.aspect) {
            Aspect.Closed -> "closed.svg"
            Aspect.Open -> "open.svg"
        }
    }
    driving { indication ->
        when (indication.aspect) {
            Aspect.Closed -> AutomaticDriving.stop()
            Aspect.Open -> AutomaticDriving.clear()
        }
    }
}
