import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BoardCardGrid } from '@/components/boards/BoardCard'
import { SubjectCard } from '@/components/subjects/SubjectCard'
import { site } from '@/lib/site'
import { useTrial } from '@/context/TrialContext'

export function BoardsSection() {
  const { openTrial } = useTrial()

  return (
    <section id="boards" className="relative overflow-hidden bg-[#f8fafc] px-4 py-24 md:px-6 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-violet-400/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="section-eyebrow mx-auto mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Boards we teach
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-charcoal md:text-5xl">
            Boards we teach
          </h2>
          <p className="mt-4 text-lg text-charcoal/55">
            CBSE and ICSE in very small batches, plus Cambridge IGCSE on a{' '}
            <span className="font-semibold text-charcoal">one-to-one basis only</span> — matched
            to your child&apos;s syllabus, not a generic timetable.
          </p>
        </motion.div>

        <div className="mt-16">
          <BoardCardGrid onBookTrial={() => openTrial()} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold text-charcoal md:text-3xl">
              Every core subject covered
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-charcoal/55 md:text-base">
              Very small batches, full attention — across the subjects that decide the report
              card.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3 lg:gap-8">
            {site.subjects.map((subject, i) => (
              <SubjectCard key={subject} subject={subject} index={i} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/subjects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal/70 transition-colors hover:text-charcoal"
            >
              View all subjects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
