import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type LeadershipCardProps = {
  name: string
  role: string
  photo: string
  quote: string
  index?: number
  accent?: 'crimson' | 'indigo'
}

const accents = {
  crimson: {
    bar: 'from-crimson to-[#e63946]',
    badge: 'from-crimson/90 to-[#e63946]',
    ring: 'ring-crimson/10',
    glow: 'group-hover:shadow-[0_28px_56px_-16px_rgba(204,0,0,0.28)]',
    quoteBg: 'from-rose-50/80 via-white to-white',
    quoteBorder: 'border-crimson/15',
    quoteAccent: 'border-crimson/35',
  },
  indigo: {
    bar: 'from-indigo-600 to-violet-600',
    badge: 'from-indigo-600 to-violet-600',
    ring: 'ring-indigo-500/10',
    glow: 'group-hover:shadow-[0_28px_56px_-16px_rgba(79,70,229,0.25)]',
    quoteBg: 'from-indigo-50/60 via-white to-white',
    quoteBorder: 'border-indigo-200/60',
    quoteAccent: 'border-indigo-400/40',
  },
} as const

export function LeadershipCard({
  name,
  role,
  photo,
  quote,
  index = 0,
  accent = 'crimson',
}: LeadershipCardProps) {
  const theme = accents[accent]

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn(
        'group relative overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 transition-all duration-500 hover:-translate-y-2',
        theme.ring,
        theme.glow,
      )}
    >
      <div className={cn('h-1.5 w-full bg-gradient-to-r', theme.bar)} />

      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[5/4]">
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/95 via-charcoal/80 to-transparent px-7 pb-7 pt-24">
          <span
            className={cn(
              'inline-flex rounded-full bg-gradient-to-r px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-md',
              theme.badge,
            )}
          >
            {role}
          </span>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            {name}
          </h3>
        </div>
      </div>

      <div
        className={cn(
          'border-t bg-gradient-to-br px-7 py-8 md:px-8 md:py-9',
          theme.quoteBg,
          theme.quoteBorder,
        )}
      >
        <blockquote
          className={cn('border-l-[3px] pl-5', theme.quoteAccent)}
        >
          <p className="text-base leading-relaxed text-charcoal/75 md:text-[17px] md:leading-[1.75]">
            &ldquo;{quote}&rdquo;
          </p>
        </blockquote>
      </div>
    </motion.article>
  )
}
