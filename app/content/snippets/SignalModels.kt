package wiki.models

import nimby.*

// Deux vocabulaires indépendants, même si leurs ordinaux commencent tous à zéro.
enum class MainAspect { Closed, Open }
enum class MainReason { Unknown, Clear }
enum class DistantAspect { Wait, Proceed }
enum class DistantReason { Unknown, MainClosed, MainOpen }

val mainSignal = signalModel(
    "mon-reseau.principal", "Principal", "textures_principal",
    fallback = Indication(MainAspect.Closed, MainReason.Unknown)
) {
    rules {
        if (fresh && routeKnown && block == Occupancy.Clear &&
            settingsStatus != SettingsStatus.Unavailable &&
            !observation.forcedStop && !observation.lampFailed)
            Indication(MainAspect.Open, MainReason.Clear)
        else Indication(MainAspect.Closed, MainReason.Unknown)
    }
    images { if (it.aspect == MainAspect.Open) "main-open.svg" else "main-closed.svg" }
}

val distantSignal = signalModel(
    "mon-reseau.annonce", "Annonce", "textures_annonce",
    fallback = Indication(DistantAspect.Wait, DistantReason.Unknown)
) {
    rules {
        when {
            !fresh || !routeKnown || block != Occupancy.Clear ||
                settingsStatus == SettingsStatus.Unavailable ||
                observation.forcedStop || observation.lampFailed ->
                Indication(DistantAspect.Wait, DistantReason.Unknown)
            next == null -> null // Demander au SDK de calculer le voisin.
            else -> when (next?.of(mainSignal)?.aspect) {
                MainAspect.Closed -> Indication(DistantAspect.Wait, DistantReason.MainClosed)
                MainAspect.Open -> Indication(DistantAspect.Proceed, DistantReason.MainOpen)
                null -> Indication(DistantAspect.Wait, DistantReason.Unknown)
            }
        }
    }
    images { if (it.aspect == DistantAspect.Proceed) "distant-proceed.svg" else "distant-wait.svg" }
}

// Exemple de composition et de lecture : aucune consigne de conduite déclarée.
fun createNetworkMod() = signalMod("mon-reseau", "Mon réseau") {
    signal(mainSignal)
    signal(distantSignal)
}
