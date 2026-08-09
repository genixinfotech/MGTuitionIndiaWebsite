import { PageShell } from '@/components/layout/PageShell'
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { BoardsSection } from '@/components/sections/BoardsSection'
import { TuitionPlansSection } from '@/components/sections/TuitionPlansSection'
import { AboutTeaserSection } from '@/components/sections/AboutTeaserSection'
import { WhyUsSection } from '@/components/sections/WhyUsSection'
import { BecomeTutorSection } from '@/components/sections/BecomeTutorSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { ContactMapSection } from '@/components/sections/ContactMapSection'

export function HomePage() {
  return (
    <PageShell>
      <HeroSection />
      <StatsSection />
      <BoardsSection />
      <TuitionPlansSection />
      <AboutTeaserSection />
      <WhyUsSection />
      <BecomeTutorSection />
      <TestimonialsSection />
      <ContactMapSection />
    </PageShell>
  )
}
