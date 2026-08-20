import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, CalendarDays, Sparkles, Users } from 'lucide-react'
import { useTrial } from '@/context/TrialContext'
import {
  batchLabelForBoard,
  batchSizeLabel,
  formatInr,
  formatSessionsLabel,
  maxEnrolmentGrade,
  minEnrolmentGrade,
  parseGradeLabel,
  plansForBoard,
  pricingBoards,
  type PricingBoardId,
} from '@/lib/tuition-plans'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'
import { PricingBoardTabs } from '@/components/pricing/PricingBoardTabs'
import { ClassTimings } from '@/components/pricing/ClassTimings'
import { pricingBoardThemes } from '@/lib/boards'

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

const planRowMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: (index: number) => ({
    delay: index * 0.09,
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  }),
}

export function TuitionPlansSection() {
  const { openTrial } = useTrial()
  const [board, setBoard] = useState<PricingBoardId>('cbse')
  const activeBoard = pricingBoards.find((item) => item.id === board) ?? pricingBoards[0]
  const batchLabel = batchLabelForBoard(board)
  const showPrices = activeBoard.showPrices
  const showTimings = !showPrices
  const plans = plansForBoard(board)
  const planGridCols =
    showPrices || showTimings
      ? 'md:grid-cols-[minmax(8rem,0.82fr)_minmax(11.5rem,1.45fr)_minmax(8rem,0.88fr)_minmax(7.25rem,0.72fr)_minmax(10rem,auto)]'
      : 'md:grid-cols-[minmax(8rem,0.9fr)_minmax(11.5rem,1.4fr)_minmax(8rem,0.85fr)_minmax(10rem,auto)]'
  const rowSpan = showPrices || showTimings ? 'col-span-5' : 'col-span-4'

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
          className={cn(
            'mt-10 overflow-hidden rounded-[32px] border shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-colors duration-500',
            pricingBoardThemes[board].panel,
            pricingBoardThemes[board].panelBorder,
          )}
        >
          <div className="p-3 md:p-5">
            <PricingBoardTabs attached value={board} onChange={setBoard} />
            <div className={cn('mt-2.5 hidden md:grid gap-x-4 gap-y-2.5', planGridCols)}>
              <p className="self-end pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Grade / Class
              </p>
              <p className="self-end pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Sessions / month
              </p>
              <p className="self-end whitespace-nowrap pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                {activeBoard.oneToOne ? 'Format' : 'Students / batch'}
              </p>
              {showPrices ? (
                <p className="self-end pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                  Rate
                </p>
              ) : showTimings ? (
                <p className="justify-self-start self-end whitespace-nowrap pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                  Timings
                </p>
              ) : null}
              <p className="justify-self-end self-end pb-1 text-right text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Action
              </p>

              {plans.map((plan, i) => (
                <motion.div
                  key={`${board}-${plan.grade}`}
                  initial={planRowMotion.initial}
                  animate={planRowMotion.animate}
                  transition={planRowMotion.transition(i)}
                  className={cn(
                    'group relative grid grid-cols-subgrid items-center gap-x-4 overflow-hidden rounded-[22px] bg-white/[0.07] px-4 py-4 ring-1 ring-white/10 transition-all duration-300 hover:bg-gradient-to-r hover:from-crimson hover:via-[#e63946] hover:to-[#9b1020] hover:shadow-[0_16px_40px_-12px_rgba(204,0,0,0.65)] hover:ring-white/25',
                    rowSpan,
                  )}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.22),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <GradeLabel
                    grade={plan.grade}
                    className="relative min-w-0 justify-self-start text-base font-semibold text-white"
                  />

                  <span className="relative inline-flex min-w-0 max-w-full items-center gap-1.5 justify-self-start rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium leading-snug text-white/80 transition-colors group-hover:border-white/20 group-hover:bg-white/20 group-hover:text-white md:text-sm">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-80" />
                    {formatSessionsLabel(plan)}
                  </span>

                  <span className="relative inline-flex min-w-0 items-center gap-1.5 justify-self-start text-base font-semibold tabular-nums text-white">
                    <Users className="h-4 w-4 shrink-0 text-white/50 transition-colors group-hover:text-white/80" />
                    {batchLabel}
                  </span>

                  {showPrices ? (
                    <div className="relative min-w-0 justify-self-start">
                      <p className="font-outfit text-2xl font-extrabold tabular-nums text-white">
                        {formatInr(plan.rate)}
                      </p>
                      <p className="text-xs text-white/40 transition-colors group-hover:text-white/70">
                        per month
                      </p>
                    </div>
                  ) : showTimings ? (
                    <ClassTimings
                      compact
                      layout="list"
                      className="relative min-w-0 justify-self-start"
                      timeClassName="font-medium text-white/75 transition-colors group-hover:text-white"
                    />
                  ) : null}

                  <button
                    type="button"
                    onClick={() => openTrial({ plan: plan.grade })}
                    className="relative inline-flex min-w-0 items-center gap-1.5 justify-self-end rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] group-hover:border-transparent group-hover:bg-white group-hover:text-crimson group-hover:shadow-lg group-hover:shadow-black/10"
                  >
                    {site.assessmentCta}
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-2.5 space-y-2.5 md:hidden">
              {plans.map((plan, i) => (
                <motion.div
                  key={`${board}-${plan.grade}-mobile`}
                  initial={planRowMotion.initial}
                  animate={planRowMotion.animate}
                  transition={planRowMotion.transition(i)}
                  className="group relative overflow-hidden rounded-[22px] bg-white/[0.07] p-5 ring-1 ring-white/10 transition-all duration-300 hover:bg-gradient-to-r hover:from-crimson hover:via-[#e63946] hover:to-[#9b1020] hover:ring-white/25"
                >
                  <div className="flex items-start justify-between gap-4">
                    <GradeLabel grade={plan.grade} className="text-lg font-bold text-white" />
                    {showPrices ? (
                      <p className="font-outfit text-2xl font-extrabold tabular-nums">
                        {formatInr(plan.rate)}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/75">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 group-hover:bg-white/20">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatSessionsLabel(plan)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 group-hover:bg-white/20">
                      <Users className="h-3.5 w-3.5" />
                      {activeBoard.oneToOne ? batchLabel : `${batchLabel} / batch`}
                    </span>
                  </div>
                  {showTimings ? (
                    <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 group-hover:bg-white/15">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                        Timings
                      </p>
                      <ClassTimings
                        compact
                        centered
                        timeClassName="text-white/80"
                      />
                    </div>
                  ) : null}
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
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center gap-4 text-center"
        >
          <p className="max-w-lg text-base text-white/55">
            {!showPrices
              ? activeBoard.oneToOne
                ? 'IGCSE tuition is one-to-one only, Classes 6–12. Grades 6–9 include 8 sessions per month; Grades 10–12 include 12 sessions. Contact us for a tailored quote.'
                : `${activeBoard.label} — very small batches of ${batchSizeLabel} students. Grades ${minEnrolmentGrade}–9 include 8 sessions per month; Grades 10–${maxEnrolmentGrade} include 12 sessions. Contact us for a tailored quote.`
              : `${activeBoard.label} prices are monthly, per subject path in very small batches of ${batchSizeLabel} students. Grades ${minEnrolmentGrade}–9 include 8 sessions per month; Grades 10–${maxEnrolmentGrade} include 12 sessions per month.`}
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
