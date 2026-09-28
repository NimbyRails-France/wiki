package wiki.translations

import nimby.*

// Identifiers stay stable; only the displayed text is translated.
val maintenance = Checkbox(
    "maintenance", tr("maintenance"), tr("maintenance.help")
)

fun summary(count: Int): String =
    tr(if (count == 1) "count.one" else "count.many", "count" to count)

fun createTranslatedTool(): ToolMod = toolMod("my-translated-tool", "My tool") {
    service("message.v1") { request ->
        showPanel(request, summary(3), listOf(
            ToolButton(request.originAction, tr("repeat"))
        ))
    }
}
