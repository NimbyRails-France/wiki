package wiki.preview

import nimby.*

// Graphical markers only, not a route planner or a construction command.
fun previewPositions(network: ToolNetwork, sourceId: Long, count: Int): List<SignalPosition> {
    require(count in 1..64) { "Choose from 1 to 64 markers." }
    val source = requireNotNull(network.signals.singleOrNull { it.id == sourceId }) {
        "The source signal is missing or duplicated."
    }
    require(network.tracks.count { it.id == source.track } == 1) { "Track unavailable." }
    // All positions are sent together. None is created in the saved network.
    return (1..count).map { index ->
        SignalPosition(source.track, index.toDouble() / (count + 1), source.direction)
    }
}

fun createPreviewTool(): ToolMod {
    var count = 3
    var active: Pair<SignalActionRequest, List<SignalPosition>>? = null
    return toolMod("preview-tool", "Preview tool") {
        service("preview.v1") { request ->
            var message = "Choose how many markers to show on the source track."
            try {
                clearSignalPreview()
                active = null
                when (request.action) {
                    "count" -> count = requireNotNull(request.value).also { require(it in 1..64) }
                    "show" -> {
                        val snapshot = network()
                        require(snapshot.worldId == worldId && snapshot.generation == generation)
                        val positions = previewPositions(snapshot, request.signalId, count)
                        showSignalPreview(request, positions)
                        active = request to positions
                        message = "Showing all ${positions.size} temporary markers."
                    }
                    "hide" -> message = "Preview hidden."
                }
            } catch (error: Exception) {
                message = "Preview unavailable. See the mod log."
                log(error.message ?: message, LogLevel.Error)
            }
            showPanel(request, message,
                buttons = listOf(ToolButton("show", "Show preview"), ToolButton("hide", "Hide")),
                inputs = listOf(ToolNumberInput("count", "Number of markers", count, 1, 64)))
        }
        onTick {
            active?.let { (request, positions) ->
                if (request.worldId != worldId || request.generation != generation) {
                    active = null
                    clearSignalPreview()
                } else {
                    try { showSignalPreview(request, positions) }
                    catch (error: Exception) {
                        active = null
                        log(error.message ?: "Preview interrupted.", LogLevel.Error)
                        // Without renewal the SDK also expires the drawing lease.
                        runCatching { clearSignalPreview() }
                    }
                }
            }
        }
        onStop { active = null }
    }
}
