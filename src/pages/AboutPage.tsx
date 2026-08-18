import { motion } from 'framer-motion'
import {
  ArrowRight,
  Heart,
  MapPin,
  Sparkles,
  BookOpen,
  Users,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { HeroHighlight, PageHero } from '@/components/layout/PageHero'
import { LeadershipCard } from '@/components/people/LeadershipCard'
import { useTrial } from '@/context/TrialContext'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const values = [
  {
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white',
    lightColor: 'bg-blue-100',
    title: 'Every child seen',
    text: 'Very small batches so tutors know each learner — not lost in a crowd, every session.',
  },
  {
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white',
    lightColor: 'bg-emerald-100',
    title: 'Syllabus-first teaching',
    text: `${site.syllabusCoverage} — matched to your child's textbook, not generic worksheets.`,
  },
  {
    icon: Heart,
    color: 'from-crimson to-[#e63946]',
    bgColor: 'bg-gradient-to-br from-rose-50 via-red-50/50 to-white',
    lightColor: 'bg-rose-100',
    title: 'Tuition within reach',
    text: 'Founded so quality tutoring is not blocked by cost, crowded centres, or distance from home.',
  },
] as const

const timeline = [
  {
    year: '2015',
    title: 'The beginning',
    text: 'MG Tuition founded to make quality small-batch tutoring accessible to every family.',
  },
  {
    year: '2016–18',
    title: 'Building the model',
    text: 'Tutor training systems mature; reach expands beyond the first cohorts of students.',
  },
  {
    year: '2019–20',
    title: 'Growing reach',
    text: 'International curricula grow — India hubs in Cherthala and Kottayam strengthen operations.',
  },
  {
    year: 'Today',
    title: 'MG Tuition India',
    text: `Focused on ${site.syllabusCoverage} — very small batches, every session.`,
  },
]

export function AboutPage() {
  const { openTrial } = useTrial()

  return (
    <PageShell>
      <PageHero
        eyebrow="About us"
        title={
          <>
            IdealMG Educare — <HeroHighlight>tutoring with a conscience</HeroHighlight>
          </>
        }
        description="Since 2015, IdealMG Educare has delivered live online tuition from Kerala — personal, honest, and built around CBSE, ICSE and IGCSE. IGCSE is offered one-to-one only."
      />

      {/* What we stand for */}
      <section className="relative bg-[#f8fafc] px-4 py-16 md:px-6 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(204,0,0,0.05),transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto mb-12 max-w-2xl text-center"
        >
          <p className="section-eyebrow mx-auto mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            What we stand for
          </p>
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
            Tutoring with a conscience
          </h2>
          <p className="mt-3 text-charcoal/55">
            {site.people.founder.name} started {site.brand} when good tuition felt too costly, too
            crowded, or too far away. These principles still guide every class we run in India today.
          </p>
        </motion.div>

        <div className="relative mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {values.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'group relative overflow-hidden rounded-3xl border border-white/60 p-7 shadow-lg',
                  item.bgColor,
                )}
              >
                <div
                  className={cn(
                    'absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-bl-full bg-gradient-to-br opacity-10 transition-transform duration-500 group-hover:scale-150',
                    item.color,
                  )}
                />
                <div className="relative mb-5">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md',
                      item.color,
                    )}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div
                    className={cn(
                      'absolute -bottom-1 left-10 h-6 w-6 -rotate-12 rounded-md',
                      item.lightColor,
                    )}
                  />
                </div>
                <h3 className="text-xl font-bold text-charcoal">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/65">{item.text}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      {/* Leadership */}
      <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-crimson/5 blur-[100px]" />
        <div className="pointer-events-none absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-indigo-400/5 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto mb-12 max-w-2xl text-center"
        >
          <p className="section-eyebrow mx-auto mb-4">
            <Users className="h-3.5 w-3.5" />
            Leadership
          </p>
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">The people behind MG Tuition</h2>
          <p className="mt-3 text-charcoal/55">
            Built by educators and operators who believe tutoring should be personal, honest, and
            accessible.
          </p>
        </motion.div>

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-10">
          <LeadershipCard
            {...site.people.founder}
            index={0}
            accent="crimson"
          />
          <LeadershipCard
            {...site.people.head}
            index={1}
            accent="indigo"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-charcoal/[0.06] bg-white px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
          {site.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center"
            >
              <p className="text-3xl font-extrabold text-crimson md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-charcoal/55">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="relative overflow-hidden bg-[#f8fafc] px-4 py-20 md:px-6 md:py-28">
        <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-crimson/10 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="section-eyebrow mx-auto mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Our journey
          </p>
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">A decade of growing alongside families</h2>
          <p className="mt-3 text-charcoal/55">
            From a parent&apos;s idea to a trusted tutoring network across India and abroad.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-3xl">
          <div
            className="absolute bottom-4 left-[19px] top-4 w-0.5 bg-gradient-to-b from-crimson via-crimson/40 to-crimson/10 md:left-1/2 md:-translate-x-px"
            aria-hidden
          />

          <ol className="space-y-8">
            {timeline.map((item, i) => (
              <motion.li
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'relative grid gap-4 md:grid-cols-2 md:gap-10',
                  i % 2 === 0 ? 'md:text-right' : 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1',
                )}
              >
                <div className={cn('pl-12 md:pl-0', i % 2 === 0 ? 'md:pr-8' : 'md:pl-8 md:text-left')}>
                  <span className="inline-flex rounded-full bg-gradient-to-r from-crimson to-[#e63946] px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-crimson/25">
                    {item.year}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-charcoal">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{item.text}</p>
                </div>

                <div className="hidden md:block" aria-hidden />

                <div
                  className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#f8fafc] bg-gradient-to-br from-crimson to-[#e63946] shadow-md md:left-1/2 md:-translate-x-1/2"
                  aria-hidden
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Kerala roots + CTA */}
      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[28px] bg-white shadow-lg ring-1 ring-charcoal/[0.06] lg:grid-cols-2">
          <div className="relative h-64 lg:h-full lg:min-h-[360px]">
            <img
              src="/images/infopark-cherthala.jpg"
              alt="IdealMG Educare office in Cherthala"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 lg:bg-gradient-to-l lg:from-transparent lg:to-white/20" />
          </div>
          <div className="px-8 pb-10 pt-6 lg:px-10 lg:py-10">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-crimson">
              <MapPin className="h-4 w-4" />
              Rooted in Kerala
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-charcoal md:text-3xl">
              Operating from Cherthala &amp; Kottayam
            </h2>
            <p className="mt-4 leading-relaxed text-charcoal/60">
              {site.legal} runs regional hubs in Kerala while delivering live small-batch classes to
              students across India — {site.syllabusCoverage}.
            </p>
            <button
              type="button"
              onClick={() => openTrial()}
              className="btn-primary mt-8 inline-flex"
            >
              {site.assessmentCta}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#cc0000] via-[#b80000] to-[#8b0000] p-8 text-center text-white shadow-[0_20px_50px_-20px_rgba(204,0,0,0.5)] md:p-10"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
          <h3 className="relative text-2xl font-bold md:text-3xl">Ready to see the difference?</h3>
          <p className="relative mx-auto mt-3 max-w-md text-white/75">
            Get a free assessment — no commitment, just a live session with a tutor matched to
            your child&apos;s board.
          </p>
          <button
            type="button"
            onClick={() => openTrial()}
            className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-crimson transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            {site.assessmentCta}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </section>
    </PageShell>
  )
}
