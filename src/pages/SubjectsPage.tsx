import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { HeroHighlight, PageHero } from '@/components/layout/PageHero'
import { BoardCardGrid } from '@/components/boards/BoardCard'
import { PricingCarousel3D } from '@/components/sections/PricingCarousel3D'
import { SubjectCard } from '@/components/subjects/SubjectCard'
import { useTrial } from '@/context/TrialContext'
import { site } from '@/lib/site'

export function SubjectsPage() {
  const { openTrial } = useTrial()

  return (
    <PageShell>
      <PageHero
        eyebrow="Subjects"
        title={
          <>
            Boards &amp; subjects <HeroHighlight>we teach</HeroHighlight>
          </>
        }
        description="Live classes mapped to CBSE, ICSE and Cambridge IGCSE — personalised pace, clear goals, and tutors who know your syllabus inside out. IGCSE is offered one-to-one only."
      />

      <section className="relative overflow-hidden bg-[#f8fafc] px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-400/10 blur-[100px]" />
          <div className="absolute -right-24 top-40 h-64 w-64 rounded-full bg-violet-400/10 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-400/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <BoardCardGrid onBookTrial={() => openTrial()} />
        </div>
      </section>

      <PricingCarousel3D />

      <section className="relative overflow-hidden bg-[#f8fafc] px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-violet-400/10 blur-[80px]" />
        <div className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-blue-400/10 blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-2xl text-center"
        >
          <p className="section-eyebrow mx-auto mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            All subjects
          </p>
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
            Taught in very small batches, at your child&apos;s pace
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-charcoal/55">
            Every subject below is available across CBSE, ICSE and IGCSE — matched to syllabus,
            not a generic worksheet pack. IGCSE classes are one-to-one only.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-3 lg:gap-8">
          {site.subjects.map((subject, i) => (
            <SubjectCard key={subject} subject={subject} index={i} learnMoreHref={false} />
          ))}
        </div>
      </section>
    </PageShell>
  )
}
