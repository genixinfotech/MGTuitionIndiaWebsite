import { pricingBoardThemes } from '@/lib/boards'
import { cn } from '@/lib/utils'
import { pricingBoards, type PricingBoardId } from '@/lib/tuition-plans'

export function PricingBoardTabs({
  value,
  onChange,
  attached = false,
  className,
}: {
  value: PricingBoardId
  onChange: (board: PricingBoardId) => void
  attached?: boolean
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label="Syllabus"
      className={cn(
        attached
          ? 'flex w-full flex-wrap items-center justify-center gap-2 border-b border-white/10 p-2 sm:gap-3 sm:p-3'
          : 'inline-flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 rounded-[28px] border border-white/15 bg-white/10 p-2 backdrop-blur-md sm:gap-3 sm:p-3',
        className,
      )}
    >
      {pricingBoards.map((board) => {
        const active = value === board.id
        const theme = pricingBoardThemes[board.id]
        return (
          <button
            key={board.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(board.id)}
            className={cn(
              'min-w-[7.5rem] flex-1 rounded-[22px] px-6 py-4 text-base font-bold tracking-tight transition-all duration-300 sm:min-w-[9rem] sm:px-10 sm:py-5 sm:text-lg md:text-xl',
              active
                ? theme.tabActive
                : cn('text-white/70 hover:text-white', theme.tabInactiveHover),
            )}
          >
            {board.label}
          </button>
        )
      })}
    </div>
  )
}
