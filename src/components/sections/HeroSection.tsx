import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useTrial } from '@/context/TrialContext'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const easeOut = [0.22, 1, 0.36, 1] as const

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: easeOut },
  },
}

export function HeroSection({ aside }: { aside?: ReactNode }) {
  const { openTrial } = useTrial()
  const split = Boolean(aside)

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#12080a] text-white">
      {/* Background image with slow zoom */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: easeOut }}
      >
        <img
          src="/images/hero-bg.png"
          alt="Student in a live online tuition session with MG Tuition"
          className="h-full w-full -scale-x-100 object-cover object-[35%_center]"
        />
      </motion.div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-[#0a0608]/55" />
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-[#0a0608]/92 via-[#12080a]/78',
          split ? 'to-[#12080a]/55' : 'to-[#12080a]/35',
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0608]/90 via-[#12080a]/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-crimson/20 via-transparent to-transparent" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 15% 60%, rgba(204,0,0,0.35), transparent 65%)',
        }}
      />

      {/* Animated glow orbs */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(204,0,0,0.5)_0%,transparent_70%)] blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -35, 0], y: [0, 25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,100,80,0.35)_0%,transparent_70%)] blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-1/3 top-0 h-64 w-[32rem] rounded-full bg-[radial-gradient(ellipse,rgba(255,77,77,0.2)_0%,transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 pb-10 pt-20 sm:pt-[6.75rem] md:px-6 md:pt-[7.5rem]">
        <div
          className={cn(
            'w-full',
            split &&
              'grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] lg:gap-12',
          )}
        >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className={split ? 'max-w-xl' : 'max-w-2xl'}
        >
          <motion.p
            variants={fadeUp}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-crimson-light" />
            Live online · Very small batches
          </motion.p>

          <motion.p
            variants={fadeUp}
            className={cn(
              'font-outfit font-extrabold tracking-tight',
              split
                ? 'text-4xl sm:text-5xl xl:text-6xl'
                : 'whitespace-nowrap text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
            )}
          >
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              {site.brand}{' '}
            </span>
            <motion.span
              className="bg-gradient-to-r from-crimson-light via-[#ff8080] to-[#ffb347] bg-[length:200%_auto] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0% center', '200% center'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            >
              India
            </motion.span>
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-5 text-xl font-medium text-white/90 sm:text-2xl md:text-3xl"
          >
            Small-batch live tuition for {site.syllabusCoverage}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-lg text-base text-white/70 sm:text-lg"
          >
            Expert tutors. Personal attention.{' '}
            <span className="font-semibold text-white">Book a Free Assessment</span>
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-6">
            {[
              { value: '8–12', label: 'Sessions / month' },
              { value: '6–8', label: 'Students / batch' },
              { value: 'Free', label: 'Assessment' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-extrabold text-crimson-light">{item.value}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openTrial()}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-crimson via-[#e63946] to-crimson-dark px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(204,0,0,0.45)]"
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ['-150%', '150%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
              />
              <span className="relative">{site.assessmentCta}</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
          </motion.div>
        </motion.div>

        {aside ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: easeOut }}
            className="relative z-10 w-full"
          >
            {aside}
          </motion.div>
        ) : null}
        </div>
      </div>

      {!split ? (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-20 left-1/2 hidden -translate-x-1/2 md:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 p-1.5"
          >
            <motion.div className="h-2 w-1 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      ) : null}
    </section>
  )
}
