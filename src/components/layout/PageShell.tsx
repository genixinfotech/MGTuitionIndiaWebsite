import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingActions } from '@/components/floating/FloatingActions'
import { TrialModal } from '@/components/floating/TrialModal'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Footer />
      <FloatingActions />
      <TrialModal />
    </div>
  )
}
