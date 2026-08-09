import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { BoardsSection } from '@/components/sections/BoardsSection'
import { useTrial } from '@/context/TrialContext'

export function TrialLandingPage() {
  const { openTrial } = useTrial()
  const [params] = useSearchParams()

  useEffect(() => {
    const ref = params.get('ref') ?? undefined
    const t = window.setTimeout(() => openTrial({ referral: ref }), 400)
    return () => window.clearTimeout(t)
  }, [openTrial, params])

  return (
    <PageShell>
      <HeroSection />
      <StatsSection />
      <BoardsSection />
    </PageShell>
  )
}
