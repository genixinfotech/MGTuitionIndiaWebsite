import './index.css'
import { ensurePublicConfig } from '@/lib/public-config'

async function bootstrap() {
  await ensurePublicConfig()

  const { StrictMode } = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { default: App } = await import('./App.tsx')

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
