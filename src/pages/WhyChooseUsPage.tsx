import { motion } from 'framer-motion'
import {
  CheckCircle2,
  HeartHandshake,
  MonitorPlay,
  Timer,
  UserRound,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { HeroHighlight, PageHero } from '@/components/layout/PageHero'
import { useTrial } from '@/context/TrialContext'
import { site } from '@/lib/site'

const features = [
  {
    icon: UserRound,
    title: 'Very small batches',
    text: 'Your child gets real attention — not lost in a large classroom.',
  },
  {
    icon: MonitorPlay,
    title: 'Live & interactive',
    text: 'Real-time teaching — questions answered on the spot, concepts checked immediately.',
  },
  {
    icon: Timer,
    title: 'Flexible scheduling',
    text: 'Sessions that fit school, exams, and family life across Indian time zones.',
  },
  {
    icon: HeartHandshake,
    title: 'Parent partnership',
    text: 'Clear communication on progress, attendance, and next steps.',
  },
]

export function WhyChooseUsPage() {
  const { openTrial } = useTrial()

  return (
    <PageShell>
      <PageHero
        eyebrow="Why MG Tuition India"
        title={
          <>
            Personal tutoring that respects <HeroHighlight>your child&apos;s pace</HeroHighlight>
          </>
        }
        description="Curriculum-aligned. Progress-tracked. Designed for all major Indian syllabi from our Kerala hubs."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass rounded-2xl p-6"
            >
              <f.icon className="mb-3 h-8 w-8 text-crimson" />
              <h2 className="text-lg font-bold text-charcoal">{f.title}</h2>
              <p className="mt-2 text-sm text-charcoal/65">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-3xl lg:grid-cols-2">
          <img
            src="/images/infopark-cherthala.jpg"
            alt="MG Tuition Cherthala office"
            className="h-full min-h-[280px] w-full object-cover"
          />
          <div className="glass rounded-none p-8 lg:rounded-r-3xl">
            <h2 className="text-2xl font-bold text-charcoal">What parents value most</h2>
            <ul className="mt-5 space-y-3">
              {[
                `Tutors trained for ${site.syllabusCoverage}`,
                'Honest diagnostics before a long commitment',
                'Subjects that matter: Maths, Science, English and more',
                `Operated by ${site.legal}`,
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm text-charcoal/75">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-crimson" />
                  {item}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => openTrial()} className="btn-primary mt-8">
              Experience a free class
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
