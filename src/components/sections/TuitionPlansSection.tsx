import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Tag } from 'lucide-react'
import { useTrial } from '@/context/TrialContext'
import { formatInr, parseGradeLabel, tuitionPlans } from '@/lib/tuition-plans'
import { cn } from '@/lib/utils'

function savings(rate: number, offer: number) {
  return rate - offer
}

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
          'linear-gradient(145deg, #1a060a 0%, #4a0c16 28%, #9b1020 52%, #c41e3a 72%, #2a0a12 100%)',
      }}
    >
      {/* Layered glow mesh */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 12% 18%, rgba(255, 90, 70, 0.55), transparent 60%), radial-gradient(ellipse 55% 50% at 88% 78%, rgba(255, 180, 80, 0.28), transparent 55%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(255, 255, 255, 0.12), transparent 50%)',
          }}
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-16 top-8 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,120,100,0.55)_0%,transparent_70%)] blur-2xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -24, 0], y: [0, 28, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(255,200,120,0.35)_0%,transparent_70%)] blur-2xl"
        />
        <motion.div
          aria-hidden
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-1/3 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.18)_0%,transparent_70%)] blur-3xl"
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.12) 48%, transparent 62%)',
          }}
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
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-crimson/30 bg-crimson/15 px-3.5 py-1.5 text-sm font-semibold uppercase tracking-wider text-crimson-light">
            <Sparkles className="h-4 w-4" />
            Tuition plans
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Simple pricing.{' '}
            <span className="bg-gradient-to-r from-white via-rose-100 to-crimson-light bg-clip-text text-transparent">
              Limited offer.
            </span>
          </h2>
          <p className="mt-5 text-xl text-white/65">
            Transparent monthly fees for live classes in very small batches — no hidden charges.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-500/20 to-rose-500/20 px-5 py-2.5 text-base font-semibold text-amber-200"
          >
            <Tag className="h-4 w-4" />
            Limited Period Offer — save up to ₹500 / month
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mt-14 overflow-hidden rounded-[28px] bg-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/5"
        >
          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-charcoal/10 bg-slate-50">
                  <th className="px-5 py-5 text-sm font-bold uppercase tracking-[0.12em] text-charcoal/50">
                    Grade / Class
                  </th>
                  <th className="px-5 py-5 text-sm font-bold uppercase tracking-[0.12em] text-charcoal/50">
                    Sessions / Month
                  </th>
                  <th className="px-5 py-5 text-sm font-bold uppercase tracking-[0.12em] text-charcoal/50">
                    Students / Batch
                  </th>
                  <th className="px-5 py-5 text-sm font-bold uppercase tracking-[0.12em] text-charcoal/50">
                    Rate
                  </th>
                  <th className="px-5 py-5 text-sm font-bold uppercase tracking-[0.12em] text-charcoal/50">
                    Discount Rate
                  </th>
                  <th className="px-5 py-5 text-right text-sm font-bold uppercase tracking-[0.12em] text-charcoal/50">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {tuitionPlans.map((plan, i) => (
                  <tr
                    key={plan.grade}
                    className={cn(
                      'group border-b border-charcoal/[0.06] last:border-b-0',
                      'hover:[background:linear-gradient(90deg,#1e3a8a_0%,#4c1d95_50%,#6b21a8_100%)]',
                      i % 2 === 1 && 'bg-slate-50/70',
                    )}
                  >
                    <td className="px-5 py-5">
                      <GradeLabel
                        grade={plan.grade}
                        className="text-lg font-semibold text-charcoal group-hover:text-white"
                      />
                    </td>
                    <td className="px-5 py-5">
                      <span className="inline-flex items-center rounded-full border border-charcoal/10 bg-slate-100 px-3.5 py-1.5 text-base font-medium text-charcoal/75 group-hover:border-white/25 group-hover:bg-white/15 group-hover:text-white">
                        {plan.sessions} sessions
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <span className="text-lg font-semibold tabular-nums text-charcoal group-hover:text-white">
                        Max {plan.studentsPerBatch}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <span className="text-lg font-medium text-charcoal/40 line-through decoration-charcoal/35 group-hover:text-white/50 group-hover:decoration-white/50">
                        {formatInr(plan.rate)}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-2xl font-extrabold tabular-nums text-crimson group-hover:text-white">
                          {formatInr(plan.offer)}
                        </span>
                        <span className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-200">
                          Save {formatInr(savings(plan.rate, plan.offer))}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-right">
                      <button
                        type="button"
                        onClick={() => openTrial({ plan: plan.grade })}
                        className="inline-flex items-center gap-1.5 rounded-full bg-crimson px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-crimson/25 group-hover:!bg-white group-hover:!text-indigo-900 group-hover:shadow-white/20 hover:scale-[1.03] hover:bg-crimson-dark group-hover:hover:!bg-white/90"
                      >
                        Book Trial
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="divide-y divide-charcoal/[0.08] md:hidden">
            {tuitionPlans.map((plan, i) => (
              <div
                key={plan.grade}
                className={cn(
                  'group p-6 hover:bg-gradient-to-r hover:from-[#1e3a8a] hover:to-[#6b21a8]',
                  i % 2 === 1 && 'bg-slate-50/80',
                )}
              >
                <GradeLabel
                  grade={plan.grade}
                  className="text-xl font-bold text-charcoal group-hover:text-white"
                />
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-base text-charcoal/60 group-hover:text-white/80">
                  <span>{plan.sessions} sessions / month</span>
                  <span>Max {plan.studentsPerBatch} students / batch</span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <span className="text-base font-medium text-charcoal/40 line-through group-hover:text-white/50">
                    {formatInr(plan.rate)}
                  </span>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold tabular-nums text-crimson group-hover:text-white">
                      {formatInr(plan.offer)}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-200">
                      Save {formatInr(savings(plan.rate, plan.offer))}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openTrial({ plan: plan.grade })}
                  className="btn-primary mt-5 w-full text-base group-hover:!bg-white group-hover:!text-indigo-900 group-hover:hover:!bg-white/90"
                >
                  Book Trial
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
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
            Prices are monthly, per subject path in very small batches. Offer rates apply while the
            limited period is live.
          </p>
          <button type="button" onClick={() => openTrial()} className="btn-primary text-base">
            Book free trial
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
