import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { createEmailMiddleware } from './server/zeptomail.mjs'
import { createStudentsMiddleware } from './server/students.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const emailApi = createEmailMiddleware(env)
  const studentsApi = createStudentsMiddleware(env)

  return {
    plugins: [
      react(),
      {
        name: 'zeptomail-api',
        configureServer(server) {
          server.middlewares.use('/api/email', emailApi)
          server.middlewares.use('/api/students', studentsApi)
        },
        configurePreviewServer(server) {
          server.middlewares.use('/api/email', emailApi)
          server.middlewares.use('/api/students', studentsApi)
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
