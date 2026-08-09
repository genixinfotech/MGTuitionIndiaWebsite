import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Tag } from 'lucide-react'
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

function getCardTransform(offset: number) {
  const abs = Math.abs(offset)
  if (abs > 3) {
    return {
      x: offset > 0 ? 640 : -640,
      z: -520,
      rotateY: offset > 0 ? -40 : 40,
      scale: 0.52,
      opacity: 0,
      blur: 8,
      zIndex: 0,
    }
  }

  if (offset === 0) {
    return { x: 0, z: 90, rotateY: 0, scale: 1, opacity: 1, blur: 0, zIndex: 30 }
  }

  const direction = offset > 0 ? 1 : -1
  const depth = abs

  return {
    x: direction * (240 + (depth - 1) * 140),
    z: -depth * 120,
    rotateY: direction * (depth === 1 ? 26 : depth === 2 ? 36 : 42),
    scale: depth === 1 ? 0.84 : depth === 2 ? 0.72 : 0.62,
    opacity: depth === 1 ? 0.9 : depth === 2 ? 0.52 : 0.28,
    blur: depth === 1 ? 0.5 : depth === 2 ? 3 : 5,
    zIndex: 30 - depth * 10,
  }
}

export function PricingCarousel3D() {
  const { openTrial } = useTrial()
  const total = tuitionPlans.length
  const [active, setActive] = useState(0)

  const goTo = useCallback(
    (index: number) => {
      setActive(Math.max(0, Math.min(index, total - 1)))
    },
    [total],
  )

  const goPrev = () => {
    if (active > 0) goTo(active - 1)
  }

  const goNext = () => {
    if (active < total - 1) goTo(active + 1)
  }

  const atStart = active === 0
  const atEnd = active === total - 1
  const activePlan = tuitionPlans[active]

  return (
    <section
      id="plans"
      className="relative w-full overflow-hidden py-24 text-white md:py-32"
      style={{
        background:
          'linear-gradient(145deg, #1a060a 0%, #4a0c16 28%, #9b1020 52%, #c41e3a 72%, #2a0a12 100%)',
      }}
    >
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
      </div>

      <div className="relative w-full px-4 md:px-8 lg:px-12">
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
            Browse monthly fees by class — swipe or use the arrows to compare.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-500/20 to-rose-500/20 px-5 py-2.5 text-base font-semibold text-amber-200">
            <Tag className="h-4 w-4" />
            Limited Period Offer — save up to ₹500 / month
          </div>
        </motion.div>

        <div className="relative mt-14 w-full">
          <button
            type="button"
            onClick={goPrev}
            disabled={atStart}
            aria-label="Previous plan"
            className="absolute left-0 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35 md:left-2 lg:h-12 lg:w-12 xl:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={atEnd}
            aria-label="Next plan"
            className="absolute right-0 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35 md:right-2 lg:h-12 lg:w-12 xl:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            className="relative mx-auto h-[min(560px,74vh)] w-full select-none overflow-hidden px-14 md:px-20 lg:px-28"
            style={{ perspective: '1500px', perspectiveOrigin: '50% 42%' }}
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -72 && !atEnd) goNext()
                else if (info.offset.x > 72 && !atStart) goPrev()
              }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {tuitionPlans.map((plan, index) => {
                const offset = index - active
                const transform = getCardTransform(offset)
                const isActive = offset === 0

                return (
                  <motion.div
                    key={plan.grade}
                    animate={{
                      x: transform.x,
                      z: transform.z,
                      rotateY: transform.rotateY,
                      scale: transform.scale,
                      opacity: transform.opacity,
                      filter: `blur(${transform.blur}px)`,
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    style={{
                      transformStyle: 'preserve-3d',
                      zIndex: transform.zIndex,
                    }}
                    className={cn(
                      'absolute w-[min(90vw,440px)] rounded-[28px] bg-white text-left shadow-[0_32px_80px_-16px_rgba(0,0,0,0.55)] ring-1 ring-black/5',
                      isActive ? 'p-8 md:p-9' : 'p-6',
                      Math.abs(offset) > 3 && 'pointer-events-none',
                    )}
                    aria-hidden={!isActive && Math.abs(offset) > 2}
                  >
                    {isActive ? (
                      <>
                        <GradeLabel
                          grade={plan.grade}
                          className="text-2xl font-bold text-charcoal md:text-3xl"
                        />

                        <div className="mt-6 flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full border border-charcoal/10 bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-charcoal/75">
                            {plan.sessions} sessions / month
                          </span>
                          <span className="inline-flex rounded-full border border-charcoal/10 bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-charcoal/75">
                            Max {plan.studentsPerBatch} students
                          </span>
                        </div>

                        <div className="mt-8 border-t border-charcoal/[0.08] pt-6">
                          <p className="text-base font-medium text-charcoal/40 line-through">
                            {formatInr(plan.rate)} / month
                          </p>
                          <p className="mt-2 text-4xl font-extrabold tabular-nums text-crimson md:text-5xl">
                            {formatInr(plan.offer)}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-emerald-600">
                            Save {formatInr(savings(plan.rate, plan.offer))} with limited offer
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openTrial({ plan: plan.grade })}
                          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-crimson px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-crimson/30 hover:bg-crimson-dark"
                        >
                          Book Trial
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => goTo(index)}
                        className="block w-full text-left"
                        aria-label={`View ${plan.grade} plan`}
                        tabIndex={Math.abs(offset) <= 2 ? 0 : -1}
                      >
                        <GradeLabel
                          grade={plan.grade}
                          className={cn(
                            'font-bold text-charcoal',
                            Math.abs(offset) === 1 ? 'text-xl md:text-2xl' : 'text-lg',
                          )}
                        />
                        <p
                          className={cn(
                            'mt-3 font-extrabold tabular-nums text-crimson',
                            Math.abs(offset) === 1 ? 'text-2xl md:text-3xl' : 'text-xl',
                          )}
                        >
                          {formatInr(plan.offer)}
                        </p>
                        <p className="mt-1 text-xs font-medium text-charcoal/45 line-through md:text-sm">
                          {formatInr(plan.rate)}
                        </p>
                      </button>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>

            <div
              aria-hidden
              className="pointer-events-none absolute bottom-6 left-1/2 h-24 w-[min(92%,560px)] -translate-x-1/2 rounded-full bg-white/10 blur-2xl"
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {tuitionPlans.map((plan, index) => (
              <button
                key={`dot-${plan.grade}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to ${plan.grade}`}
                aria-current={index === active ? 'true' : undefined}
                className={cn(
                  'rounded-full transition-all',
                  index === active
                    ? 'h-2.5 w-8 bg-white'
                    : 'h-2.5 w-2.5 bg-white/35 hover:bg-white/55',
                )}
              />
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-white/45">
            Viewing{' '}
            <span className="font-semibold text-white/75">
              <GradeLabel grade={activePlan.grade} />
            </span>{' '}
            · {formatInr(activePlan.offer)}/month
          </p>
        </div>
      </div>
    </section>
  )
}
