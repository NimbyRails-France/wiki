import hljs from 'highlight.js/lib/core'
import kotlin from 'highlight.js/lib/languages/kotlin'
import json from 'highlight.js/lib/languages/json'
import powershell from 'highlight.js/lib/languages/powershell'
import ini from 'highlight.js/lib/languages/ini'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'

for (const [name, grammar] of Object.entries({ kotlin, json, powershell, ini, xml, bash })) {
  hljs.registerLanguage(name, grammar)
}
export function highlight(code: string, language = 'kotlin') {
  const name = language === 'properties' ? 'ini' : language
  // highlight.js escapes the source; only its generated spans become HTML.
  return hljs.getLanguage(name)
    ? hljs.highlight(code, { language: name, ignoreIllegals: true }).value
    : code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
