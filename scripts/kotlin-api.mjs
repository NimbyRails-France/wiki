/** Small declaration reader for this SDK's Kotlin sources. It deliberately
 * excludes method bodies and private/internal scopes. Not a Kotlin compiler:
 * compilation of the API and examples remains a separate required check. */
export function maskKotlin(source) {
  return source.replace(
    /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    (value) => value.replace(/[^\n]/g, ' '),
  )
}

export function declarations(source) {
  const mask = maskKotlin(source)
  const pairs = new Map(),
    stack = [],
    containers = new Map()
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === '{') stack.push(i)
    if (mask[i] === '}') {
      const open = stack.pop()
      if (open !== undefined) pairs.set(open, i)
    }
  }
  const pattern =
    /^[ \t]*(?:@[\w.]+(?:\([^\n]*\))?[ \t]*)*((?:(?:public|private|internal|protected|abstract|open|override|data|enum|annotation|sealed|inline|suspend|operator|infix|tailrec|external|actual|expect|const|lateinit|companion)\s+)*)(class|object|interface|fun|val|var|typealias)\s+([^\n]*)/gm
  const records = [],
    headers = []
  for (const match of mask.matchAll(pattern)) {
    const start = match.index
    // Constructor properties are already present in the enclosing signature.
    // In particular, do not leak properties of an internal data class.
    if (headers.some(([begin, end]) => begin < start && start < end)) continue
    const modifiers = match[1].trim().split(/\s+/)
    const kind = match[2]
    const enclosing = [...containers.values()].filter((c) => c.open < start && start < c.close)
    // A declaration inside a function, lambda, initializer, or hidden type is
    // not public API. Public class and companion object bodies are allowed.
    const braceParents = [...pairs].filter(([open, close]) => open < start && start < close)
    const visible =
      !modifiers.some((m) => ['private', 'internal', 'protected'].includes(m)) &&
      braceParents.every(([open]) => containers.get(open)?.visible)
    let at = start + match[0].indexOf(kind),
      round = 0,
      square = 0,
      end = at,
      body = null
    for (; end < mask.length; end++) {
      const c = mask[end]
      if (c === '(') round++
      if (c === ')') round--
      if (c === '[') square++
      if (c === ']') square--
      if (round === 0 && square === 0) {
        if (c === '{') {
          body = end
          break
        }
        if (c === '=' || c === ';' || c === '\n') break
      }
    }
    const header = source
      .slice(start, end)
      .trim()
      .replace(/^@[^\n]+\n/g, '')
    // Function type parameters may precede a function name.
    const rest = mask.slice(at + kind.length, end).trim()
    const name =
      kind === 'fun'
        ? rest
            .split('(')[0]
            .trim()
            .match(/([\w]+)$/)?.[1]
        : rest.match(/^[\w]+/)?.[0]
    if (['class', 'object', 'interface'].includes(kind) && body !== null) {
      containers.set(body, {
        open: body,
        close: pairs.get(body) ?? mask.length,
        name: name || 'Companion',
        visible,
      })
    }
    if (['class', 'object', 'interface'].includes(kind)) headers.push([start, end])
    if (!visible || !name) continue
    const prefix = source.slice(0, start)
    const kdoc =
      prefix
        .match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*(?:@[^\n]+\s*)*$/)?.[1]
        ?.replace(/^\s*\* ?/gm, '')
        .trim() || ''
    let signature = header
    const constructorProperties = []
    // An internal constructor is not an invitation to provide native handles
    // or callbacks. Keep its public properties as members, hide transport args.
    const hiddenConstructor =
      kind === 'class' && /\b(private|internal|protected)\s+constructor\s*\(/.exec(header)
    if (hiddenConstructor) {
      const headerMask = maskKotlin(header)
      const open = header.indexOf('(', hiddenConstructor.index)
      let close = open + 1,
        depth = 1
      for (; close < headerMask.length && depth; close++) {
        if (headerMask[close] === '(') depth++
        if (headerMask[close] === ')') depth--
      }
      const params = header.slice(open + 1, close - 1)
      const maskedParams = maskKotlin(params)
      let from = 0,
        nested = 0,
        generic = 0
      for (let i = 0; i <= params.length; i++) {
        const c = maskedParams[i]
        if (c === '(' || c === '[') nested++
        if (c === ')' || c === ']') nested--
        if (c === '<') generic++
        if (c === '>' && maskedParams[i - 1] !== '-' && generic > 0) generic--
        if (i === params.length || (c === ',' && nested === 0 && generic === 0)) {
          const param = params.slice(from, i).trim()
          const property = /^(?:(?:public|override)\s+)*(val|var)\s+(\w+)\s*:/.exec(param)
          if (property)
            constructorProperties.push({ name: property[2], kind: property[1], signature: param })
          from = i + 1
        }
      }
      // Constructor annotations belong to the hidden constructor, not the type.
      signature =
        header
          .slice(0, hiddenConstructor.index)
          .replace(/(?:\s+@[\w.]+(?:\([^\n]*?\))?)+\s*$/, '')
          .trim() + header.slice(close)
    }
    // Inferred return/property types need their expression for clarity. Keep
    // only the first expression line, and explicitly mark multiline bodies.
    if (mask[end] === '=') {
      const lineEnd = source.indexOf('\n', end)
      const expression = source.slice(end, lineEnd < 0 ? source.length : lineEnd).trim()
      signature += ' ' + expression
    }
    if (modifiers.includes('enum') && body !== null) {
      // Only a top-level Kotlin semicolon terminates enum entries. A semicolon
      // inside KDoc (DrivingFlag.ApproachPassable), a string or an entry body
      // must never truncate the public values shown in the reference.
      let entriesEnd = pairs.get(body) ?? mask.length,
        depth = 0
      for (let i = body + 1; i < entriesEnd; i++) {
        if ('({['.includes(mask[i])) depth++
        else if (')}]'.includes(mask[i])) depth--
        else if (mask[i] === ';' && depth === 0) {
          entriesEnd = i
          break
        }
      }
      const enumBody = source.slice(body + 1, entriesEnd).trim()
      signature += ' {\n' + enumBody + '\n}'
    }
    const owner = enclosing.map((c) => c.name).join('.')
    records.push({
      name,
      owner,
      kind,
      signature,
      documentation: hiddenConstructor
        ? `${kdoc}\nConstruction réservée au SDK : utilisez la fonction de création ou le contexte fourni.`.trim()
        : kdoc,
      line: source.slice(0, start).split('\n').length,
    })
    for (const property of constructorProperties)
      records.push({
        ...property,
        owner: [owner, name].filter(Boolean).join('.'),
        documentation: '',
        line: source.slice(0, start).split('\n').length,
      })
  }
  return records
}
