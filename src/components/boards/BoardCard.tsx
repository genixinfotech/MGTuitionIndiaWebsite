import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { boardThemes } from '@/lib/boards'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

type Board = (typeof site.boards)[number]

type BoardCardProps = {
  board: Board
  index?: number
  onBookTrial: () => void
}

export function BoardCard({ board, index = 0, onBookTrial }: BoardCardProps) {
  const theme = boardThemes[board.id]
  const Icon = theme.icon
  const topics = board.topics.slice(0, 3)

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn(
        'group relative flex h-full flex-col rounded-[28px] bg-white shadow-lg ring-1 transition-all duration-500 hover:-translate-y-2',
        theme.ring,
        theme.shadow,
        theme.glow,
      )}
    >
      {board.topBadge ? (
        <span
          className={cn(
            'absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-gradient-to-r px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_28px_-10px_rgba(15,23,42,0.65)] ring-1 ring-white/15',
            theme.badgeGradient,
          )}
        >
          {board.topBadge}
        </span>
      ) : null}
      <div
        className={cn(
          'relative overflow-hidden rounded-t-[28px] bg-gradient-to-br px-7 pb-12 pt-7 text-white',
          theme.gradient,
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.28),transparent_42%)]" />
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-125',
            theme.orb,
          )}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-white/10 blur-2xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-7 -right-1 select-none font-outfit text-[6.5rem] font-black leading-none tracking-tighter text-white/[0.14] transition-transform duration-500 group-hover:scale-110"
        >
          {theme.mark}
        </span>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-inner shadow-white/10 backdrop-blur-md transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105">
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-md">
              {board.tag}
            </span>
            <span className="font-outfit text-xs font-semibold tabular-nums text-white/55">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        <p className="relative mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
          {board.eyebrow}
        </p>
        <h3 className="relative mt-1.5 font-outfit text-3xl font-extrabold tracking-tight">
          {board.name}
        </h3>
        <p className="relative mt-1.5 text-sm font-medium text-white/80">{board.levels}</p>
        <span className="relative mt-4 block h-1 w-12 rounded-full bg-white/50 transition-all duration-500 group-hover:w-20" />
      </div>

      <div className="relative -mt-5 flex flex-1 flex-col rounded-[24px] bg-white px-7 pb-7 pt-7">
        <p className="text-sm leading-relaxed text-charcoal/60">{board.description}</p>

        <ul className="mt-6 flex-1 space-y-0">
          {topics.map((topic, i) => (
            <li key={topic} className="flex gap-3">
              <span className="flex w-5 shrink-0 flex-col items-center">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm',
                    theme.check,
                  )}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {i < topics.length - 1 ? (
                  <span className={cn('mt-1 w-px flex-1 opacity-25', theme.check)} />
                ) : null}
              </span>
              <span
                className={cn(
                  'text-[13px] leading-snug text-charcoal/70',
                  i < topics.length - 1 ? 'pb-3.5' : '',
                )}
              >
                {topic}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onBookTrial}
          className={cn(
            'mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.015] hover:shadow-lg',
            theme.gradient,
          )}
        >
          {site.assessmentCta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.article>
  )
}

export function BoardCardGrid({ onBookTrial }: { onBookTrial: () => void }) {
  return (
    <div className="grid gap-7 pt-5 md:grid-cols-3">
      {site.boards.map((board, i) => (
        <BoardCard key={board.id} board={board} index={i} onBookTrial={onBookTrial} />
      ))}
    </div>
  )
}
