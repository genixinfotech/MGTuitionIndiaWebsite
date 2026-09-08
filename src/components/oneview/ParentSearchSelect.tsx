import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { ChevronDown, Search, Users, X } from 'lucide-react'
import { fieldClass } from '@/components/forms/FormField'
import type { ParentOption } from '@/lib/parents'
import { cn } from '@/lib/utils'

function parentName(parent: ParentOption) {
  return parent.full_name?.trim() || 'Unnamed'
}

function parentMeta(parent: ParentOption) {
  return [parent.email, parent.phone].filter(Boolean).join(' · ')
}

function parentHaystack(parent: ParentOption) {
  return [parent.full_name, parent.email, parent.phone].filter(Boolean).join(' ').toLowerCase()
}

function ParentOptionRow({
  parent,
  selected,
  onSelect,
}: {
  parent: ParentOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'w-full px-3 py-2.5 text-left transition-colors hover:bg-crimson/[0.05]',
        selected && 'bg-crimson/[0.08]',
      )}
    >
      <p className="font-medium text-charcoal">{parentName(parent)}</p>
      <p className="mt-0.5 text-xs text-charcoal/50">{parentMeta(parent)}</p>
    </button>
  )
}

export function ParentSearchSelect({
  parents,
  value,
  onChange,
  disabled = false,
}: {
  parents: ParentOption[]
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedParent = useMemo(
    () => parents.find((parent) => parent.id === value) ?? null,
    [parents, value],
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return parents
    return parents.filter((parent) => parentHaystack(parent).includes(term))
  }, [parents, query])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [open])

  function handleSelect(id: string) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  function handleClear(event: ReactMouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onChange('')
    setQuery('')
    setOpen(true)
    window.requestAnimationFrame(() => searchRef.current?.focus())
  }

  return (
    <div ref={rootRef} className="relative">
      {open ? (
        <div className="relative">
          <span className="pointer-events-none absolute left-0 top-1/2 z-10 flex w-11 -translate-y-1/2 justify-center text-crimson">
            <Search className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <input
            ref={searchRef}
            type="search"
            disabled={disabled}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or phone…"
            className={cn(fieldClass(true), 'pr-10')}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="parent-search-listbox"
            role="combobox"
          />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setQuery('')
            }}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-charcoal/40 hover:text-charcoal"
            aria-label="Close parent search"
          >
            <ChevronDown className="h-4 w-4 rotate-180" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            fieldClass(true),
            'relative flex min-h-[2.75rem] w-full items-center gap-1 py-2',
            disabled && 'opacity-60',
          )}
        >
          <span className="pointer-events-none absolute left-0 top-1/2 z-10 flex w-11 -translate-y-1/2 justify-center text-crimson">
            <Users className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(true)}
            className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {selectedParent ? (
              <>
                <span className="block truncate font-medium text-charcoal">{parentName(selectedParent)}</span>
                <span className="mt-0.5 block truncate text-xs text-charcoal/50">
                  {parentMeta(selectedParent)}
                </span>
              </>
            ) : (
              <span className="block text-charcoal/45">Search or select a parent…</span>
            )}
          </button>
          {selectedParent ? (
            <button
              type="button"
              disabled={disabled}
              onClick={handleClear}
              className="shrink-0 rounded-md p-1 text-charcoal/35 hover:bg-charcoal/[0.05] hover:text-charcoal disabled:cursor-not-allowed"
              aria-label="Clear selected parent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <ChevronDown className="mr-3 h-4 w-4 shrink-0 text-charcoal/40" />
        </div>
      )}

      {open ? (
        <div
          id="parent-search-listbox"
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-charcoal/10 bg-white py-1 shadow-[0_16px_40px_-20px_rgba(45,45,45,0.35)]"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-sm text-charcoal/50">No parents match your search.</p>
          ) : (
            filtered.map((parent) => (
              <ParentOptionRow
                key={parent.id}
                parent={parent}
                selected={parent.id === value}
                onSelect={() => handleSelect(parent.id)}
              />
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
