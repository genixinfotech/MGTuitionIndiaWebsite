import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createEmailMiddleware } from './server/zeptomail.mjs'
import { createStudentsMiddleware } from './server/students.mjs'
import {
  createPublicConfigMiddleware,
  injectPublicConfig,
  readPublicConfig,
} from './server/public-config.mjs'
import { getSiteBrand } from './server/regions.mjs'

const Passenger = globalThis.PhusionPassenger
if (Passenger) {
  Passenger.configure({ autoInstall: false })
}

const root = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(root, 'dist')
const port = Number(process.env.PORT || 4173)
const blockedPublicFiles = new Set([
  '.env',
  '.env.example',
  'server.mjs',
  'package.json',
  'package-lock.json',
])

function loadDotEnv() {
  const file = path.join(root, '.env')
  if (!fs.existsSync(file)) return
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadDotEnv()
const emailMiddleware = createEmailMiddleware(process.env)
const studentsMiddleware = createStudentsMiddleware(process.env)
const publicConfigMiddleware = createPublicConfigMiddleware(process.env)

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath)
  if (path.basename(filePath) === 'index.html') {
    const html = fs.readFileSync(filePath, 'utf8')
    res.setHeader('Content-Type', mime['.html'])
    res.end(injectPublicConfig(html, readPublicConfig(process.env)))
    return
  }
  res.setHeader('Content-Type', mime[ext] || 'application/octet-stream')
  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (url.pathname === '/api/email') {
    await emailMiddleware(req, res)
    return
  }

  if (url.pathname === '/api/students') {
    await studentsMiddleware(req, res)
    return
  }

  if (url.pathname === '/api/public-config') {
    publicConfigMiddleware(req, res)
    return
  }

  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  const baseName = path.basename(safePath)
  if (
    blockedPublicFiles.has(baseName) ||
    safePath.split(path.sep).includes('server') ||
    baseName.startsWith('.env')
  ) {
    res.statusCode = 404
    res.end('Not found')
    return
  }

  const requested = path.join(publicDir, safePath)
  const filePath = fs.existsSync(requested) && fs.statSync(requested).isFile()
    ? requested
    : path.join(publicDir, 'index.html')

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404
    res.end('Not found')
    return
  }

  sendFile(res, filePath)
})

if (Passenger) {
  server.listen('passenger')
} else {
  server.listen(port, () => {
    const { name, region } = getSiteBrand(process.env)
    console.log(`${name} (${region}) listening on http://localhost:${port}`)
  })
}
