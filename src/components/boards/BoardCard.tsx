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

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg ring-1 transition-all duration-300 hover:-translate-y-1.5',
        theme.ring,
        theme.shadow,
        theme.glow,
      )}
    >
      <div className={cn('relative bg-gradient-to-br px-7 pb-8 pt-7 text-white', theme.gradient)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="relative flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            {board.tag}
          </span>
        </div>
        <h3 className="relative mt-5 text-2xl font-bold">{board.name}</h3>
        <p className="relative mt-1 text-sm font-medium text-white/80">{board.levels}</p>
      </div>

      <div className="flex flex-1 flex-col px-7 pb-7 pt-6">
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-charcoal/60">{board.description}</p>

          <ul className="mt-5 space-y-2.5">
            {board.topics.slice(0, 3).map((topic) => (
              <li key={topic} className="flex gap-2.5 text-[13px] leading-snug text-charcoal/70">
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white',
                    theme.check,
                  )}
                >
                  <Check className="h-3 w-3" />
                </span>
                {topic}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onBookTrial}
          className={cn(
            'mt-8 inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
            theme.gradient,
          )}
        >
          Book Trial Class
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.article>
  )
}

export function BoardCardGrid({ onBookTrial }: { onBookTrial: () => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {site.boards.map((board, i) => (
        <BoardCard key={board.id} board={board} index={i} onBookTrial={onBookTrial} />
      ))}
    </div>
  )
}
