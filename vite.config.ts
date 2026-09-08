import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { createEmailMiddleware } from './server/zeptomail.mjs'
import { createStudentsMiddleware } from './server/students.mjs'
import { createParentsMiddleware } from './server/parents.mjs'
import { createTutorsMiddleware } from './server/tutors.mjs'
import { createUsersMiddleware } from './server/users.mjs'
import { createPaymentsMiddleware } from './server/payments.mjs'
import { createPublicConfigMiddleware } from './server/public-config.mjs'

function applyDotEnv(dir: string) {
  const file = path.join(dir, '.env')
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

export default defineConfig(({ mode }) => {
  applyDotEnv(process.cwd())
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  const emailApi = createEmailMiddleware(env)
  const studentsApi = createStudentsMiddleware(env)
  const parentsApi = createParentsMiddleware(env)
  const tutorsApi = createTutorsMiddleware(env)
  const usersApi = createUsersMiddleware(env)
  const paymentsApi = createPaymentsMiddleware(env)
  const publicConfigApi = createPublicConfigMiddleware(env)

  return {
    plugins: [
      react(),
      {
        name: 'zeptomail-api',
        configureServer(server) {
          server.middlewares.use('/api/email', emailApi)
          server.middlewares.use('/api/students', studentsApi)
          server.middlewares.use('/api/parents', parentsApi)
          server.middlewares.use('/api/tutors', tutorsApi)
          server.middlewares.use('/api/users', usersApi)
          server.middlewares.use('/api/payments', paymentsApi)
          server.middlewares.use('/api/public-config', publicConfigApi)
        },
        configurePreviewServer(server) {
          server.middlewares.use('/api/email', emailApi)
          server.middlewares.use('/api/students', studentsApi)
          server.middlewares.use('/api/parents', parentsApi)
          server.middlewares.use('/api/tutors', tutorsApi)
          server.middlewares.use('/api/users', usersApi)
          server.middlewares.use('/api/payments', paymentsApi)
          server.middlewares.use('/api/public-config', publicConfigApi)
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
