import { motion } from 'framer-motion'
import { ArrowRight, ClipboardCheck, LineChart, Sparkles, Target, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Assess',
    text: 'We map strengths, gaps, and board syllabus so every plan starts from real data.',
    accent: {
      icon: 'from-rose-500/30 to-crimson/20',
      glow: 'group-hover:shadow-[0_24px_48px_-16px_rgba(204,0,0,0.45)]',
      bar: 'from-crimson to-[#e63946]',
      number: 'text-crimson-light/90',
    },
  },
  {
    icon: Target,
    title: 'Plan',
    text: 'A clear weekly path with goals your child — and you — can understand.',
    accent: {
      icon: 'from-amber-400/30 to-orange-500/20',
      glow: 'group-hover:shadow-[0_24px_48px_-16px_rgba(245,158,11,0.35)]',
      bar: 'from-amber-400 to-orange-500',
      number: 'text-amber-300/90',
    },
  },
  {
    icon: Users,
    title: 'Teach',
    text: 'Live sessions in very small batches with tutors trained for Indian curricula.',
    accent: {
      icon: 'from-sky-400/30 to-indigo-500/20',
      glow: 'group-hover:shadow-[0_24px_48px_-16px_rgba(99,102,241,0.35)]',
      bar: 'from-sky-400 to-indigo-500',
      number: 'text-sky-300/90',
    },
  },
  {
    icon: LineChart,
    title: 'Track',
    text: 'Progress updates and adjustments so momentum never stalls.',
    accent: {
      icon: 'from-emerald-400/30 to-teal-500/20',
      glow: 'group-hover:shadow-[0_24px_48px_-16px_rgba(16,185,129,0.35)]',
      bar: 'from-emerald-400 to-teal-500',
      number: 'text-emerald-300/90',
    },
  },
]

export function WhyUsSection() {
  return (
    <section className="relative overflow-hidden bg-[#12080a] px-4 py-24 text-white md:px-6 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a0e] via-[#1c1014] to-[#0d0809]" />
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-crimson/25 blur-[120px]" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-crimson-light/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(204,0,0,0.16),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-crimson-light backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Why choose us
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            A method parents can{' '}
            <span className="bg-gradient-to-r from-white via-rose-100 to-crimson-light bg-clip-text text-transparent">
              trust
            </span>
          </h2>
          <p className="mt-5 text-lg text-white/60">
            Assess → Plan → Teach → Track. Simple, transparent, and built around your child.
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[12%] right-[12%] top-[2.35rem] hidden h-px bg-gradient-to-r from-crimson/0 via-white/20 to-emerald-400/0 lg:block"
          />

          {steps.map((step, i) => {
            const Icon = step.icon

            return (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={cn(
                  'group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl',
                  'shadow-[0_16px_40px_-20px_rgba(0,0,0,0.6)] transition-shadow duration-500',
                  step.accent.glow,
                )}
              >
                <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', step.accent.bar)} />
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute -right-1 -top-3 select-none text-7xl font-extrabold leading-none',
                    step.accent.number,
                    'opacity-[0.12]',
                  )}
                >
                  0{i + 1}
                </span>

                <div
                  className={cn(
                    'relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br',
                    step.accent.icon,
                  )}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                </div>

                <h3 className="relative text-xl font-bold tracking-tight">
                  <span className={cn('mr-2 text-sm font-bold uppercase tracking-[0.14em]', step.accent.number)}>
                    0{i + 1}
                  </span>
                  {step.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-white/65">{step.text}</p>
              </motion.article>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            to="/why-choose-us"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/15"
          >
            See why families stay
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
