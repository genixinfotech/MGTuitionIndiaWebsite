import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, Sparkles, Users } from 'lucide-react'
import { useTrial } from '@/context/TrialContext'
import {
  batchSizeLabel,
  formatInr,
  formatSessionsLabel,
  parseGradeLabel,
  tuitionPlans,
} from '@/lib/tuition-plans'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const planCols =
  'md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)_14rem]'

function GradeLabel({ grade, className }: { grade: string; className?: string }) {
  const parts = parseGradeLabel(grade)
  if (!parts) {
    return <span className={className}>{grade}</span>
  }

  return (
    <span className={className}>
      {parts.number}
      <sup className="ml-px text-[0.6em] font-semibold leading-none">{parts.suffix}</sup>
      {parts.rest}
    </span>
  )
}

export function TuitionPlansSection() {
  const { openTrial } = useTrial()

  return (
    <section
      id="plans"
      className="relative overflow-hidden px-4 py-24 text-white md:px-6 md:py-32"
      style={{
        background:
          'linear-gradient(160deg, #070b16 0%, #0c1730 32%, #132a4a 58%, #0a1628 82%, #071018 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 10% 12%, rgba(56, 189, 248, 0.22), transparent 58%), radial-gradient(ellipse 55% 50% at 90% 80%, rgba(99, 102, 241, 0.28), transparent 55%), radial-gradient(ellipse 45% 40% at 50% 100%, rgba(255, 255, 255, 0.08), transparent 50%)',
          }}
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-16 top-8 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28)_0%,transparent_70%)] blur-2xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -24, 0], y: [0, 28, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.32)_0%,transparent_70%)] blur-2xl"
        />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-sky-300" />
            Tuition plans
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Simple pricing.{' '}
            <span className="bg-gradient-to-r from-white via-sky-100 to-indigo-300 bg-clip-text text-transparent">
              Per month.
            </span>
          </h2>
          <p className="mt-5 text-xl text-white/65">
            Transparent monthly fees for live classes in very small batches — no hidden charges.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mt-14 rounded-[32px] border border-white/15 bg-black/25 p-3 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-5"
        >
          <div className={cn('hidden gap-x-4 gap-y-2.5 md:grid', planCols)}>
            <div className="col-span-5 grid grid-cols-subgrid px-5 py-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Grade / Class
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Sessions / month
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Students / batch
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Rate</p>
              <p className="text-right text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Action
              </p>
            </div>

            {tuitionPlans.map((plan, i) => (
              <motion.div
                key={plan.grade}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="group relative col-span-5 grid grid-cols-subgrid items-center overflow-hidden rounded-[22px] bg-white/[0.07] px-5 py-4 ring-1 ring-white/10 transition-all duration-300 hover:bg-gradient-to-r hover:from-crimson hover:via-[#e63946] hover:to-[#9b1020] hover:shadow-[0_16px_40px_-12px_rgba(204,0,0,0.65)] hover:ring-white/25"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.22),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <GradeLabel
                  grade={plan.grade}
                  className="relative text-base font-semibold text-white"
                />

                <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors group-hover:border-white/20 group-hover:bg-white/20 group-hover:text-white">
                  <CalendarDays className="h-3.5 w-3.5 opacity-80" />
                  {formatSessionsLabel(plan)}
                </span>

                <span className="relative inline-flex items-center gap-1.5 text-base font-semibold tabular-nums text-white">
                  <Users className="h-4 w-4 text-white/50 transition-colors group-hover:text-white/80" />
                  {batchSizeLabel}
                </span>

                <div className="relative">
                  <p className="font-outfit text-2xl font-extrabold tabular-nums text-white">
                    {formatInr(plan.rate)}
                  </p>
                  <p className="text-xs text-white/40 transition-colors group-hover:text-white/70">
                    per month
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openTrial({ plan: plan.grade })}
                  className="relative inline-flex justify-self-end items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] group-hover:border-transparent group-hover:bg-white group-hover:text-crimson group-hover:shadow-lg group-hover:shadow-black/10"
                >
                  {site.assessmentCta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="space-y-2.5 md:hidden">
            {tuitionPlans.map((plan, i) => (
              <motion.div
                key={plan.grade}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="group relative overflow-hidden rounded-[22px] bg-white/[0.07] p-5 ring-1 ring-white/10 transition-all duration-300 hover:bg-gradient-to-r hover:from-crimson hover:via-[#e63946] hover:to-[#9b1020] hover:ring-white/25"
              >
                <div className="flex items-start justify-between gap-4">
                  <GradeLabel grade={plan.grade} className="text-lg font-bold text-white" />
                  <p className="font-outfit text-2xl font-extrabold tabular-nums">
                    {formatInr(plan.rate)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/75">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 group-hover:bg-white/20">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatSessionsLabel(plan)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 group-hover:bg-white/20">
                    <Users className="h-3.5 w-3.5" />
                    {batchSizeLabel} / batch
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openTrial({ plan: plan.grade })}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white group-hover:border-transparent group-hover:bg-white group-hover:text-crimson"
                >
                  {site.assessmentCta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center gap-4 text-center"
        >
          <p className="max-w-lg text-base text-white/55">
            Prices are monthly, per subject path in very small batches of {batchSizeLabel} students.
            Grades 9–12 include 8–12 sessions per month.
          </p>
          <button type="button" onClick={() => openTrial()} className="btn-primary text-base">
            {site.assessmentCta}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
