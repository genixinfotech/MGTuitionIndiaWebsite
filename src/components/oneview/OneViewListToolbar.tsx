import { Search } from 'lucide-react'
import { alphabetFilters, type LetterFilter, type OneViewFilterConfig } from '@/lib/oneview-filters'
import { cn } from '@/lib/utils'

export function OneViewListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  resultCount,
  resultLabel,
  loading,
  filters,
  letter,
  onLetterChange,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  resultCount: number
  resultLabel: string
  loading: boolean
  filters: OneViewFilterConfig[]
  letter: LetterFilter
  onLetterChange: (letter: LetterFilter) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="input-field pl-10"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {filters.map((filter) => (
            <label key={filter.id} className="flex items-center gap-2">
              <span className="sr-only">{filter.label}</span>
              <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                aria-label={filter.label}
                className="input-field min-w-[9rem] py-2.5 text-sm"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <LetterLink active={letter === 'all'} onClick={() => onLetterChange('all')}>
          All
        </LetterLink>
        {alphabetFilters.map((value) => (
          <LetterLink key={value} active={letter === value} onClick={() => onLetterChange(value)}>
            {value}
          </LetterLink>
        ))}
      </div>

      <p className="text-sm text-charcoal/55">
        {loading
          ? `Loading ${resultLabel}…`
          : `${resultCount} ${resultLabel}${resultCount === 1 ? '' : ''}`}
      </p>
    </div>
  )
}

function LetterLink({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-colors',
        active
          ? 'border-crimson bg-crimson text-white shadow-sm shadow-crimson/20'
          : 'border-charcoal/10 bg-white text-charcoal/60 hover:border-crimson/20 hover:bg-crimson/[0.04] hover:text-crimson',
      )}
    >
      {children}
    </button>
  )
}
