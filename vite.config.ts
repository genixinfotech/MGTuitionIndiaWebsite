import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { createEmailMiddleware } from './server/zeptomail.mjs'
import { createStudentsMiddleware } from './server/students.mjs'
import { createParentsMiddleware } from './server/parents.mjs'
import { createTutorsMiddleware } from './server/tutors.mjs'
import { createUsersMiddleware } from './server/users.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const emailApi = createEmailMiddleware(env)
  const studentsApi = createStudentsMiddleware(env)
  const parentsApi = createParentsMiddleware(env)
  const tutorsApi = createTutorsMiddleware(env)
  const usersApi = createUsersMiddleware(env)

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
        },
        configurePreviewServer(server) {
          server.middlewares.use('/api/email', emailApi)
          server.middlewares.use('/api/students', studentsApi)
          server.middlewares.use('/api/parents', parentsApi)
          server.middlewares.use('/api/tutors', tutorsApi)
          server.middlewares.use('/api/users', usersApi)
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
