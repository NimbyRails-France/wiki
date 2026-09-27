import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'

// A localhost-only preview of the generated site for browser checks.
const root = resolve('.output/public')
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
}
createServer(async (req, res) => {
  try {
    let path = resolve(
      root,
      '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname),
    )
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403).end()
      return
    }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html')
    const body = await readFile(path)
    res
      .writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' })
      .end(body)
  } catch {
    res
      .writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      .end(await readFile(resolve(root, '404.html')))
  }
}).listen(4173, '127.0.0.1', () => console.log('Wiki preview: http://127.0.0.1:4173'))
