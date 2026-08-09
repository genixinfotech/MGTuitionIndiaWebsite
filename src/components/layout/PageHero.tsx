import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

type PageHeroProps = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1012] via-[#2d1215] to-[#1a1012] px-4 pb-20 pt-36 text-white md:px-6 md:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-crimson/25 blur-[120px]" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-crimson-light/15 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(204,0,0,0.18),transparent)]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-crimson-light backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          {eyebrow}
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">{title}</h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/65">{description}</p>
        ) : null}
      </motion.div>
    </section>
  )
}

export function HeroHighlight({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-crimson-light to-white bg-clip-text text-transparent">
      {children}
    </span>
  )
}
