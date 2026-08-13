import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function FormField({
  label,
  icon: Icon,
  iconAlign = 'center',
  children,
}: {
  label: string
  icon?: LucideIcon
  iconAlign?: 'center' | 'top'
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
        {label}
      </span>
      <span className="relative block">
        {Icon ? (
          <span
            className={cn(
              'pointer-events-none absolute left-0 z-10 flex w-11 justify-center text-crimson',
              iconAlign === 'top' ? 'top-3.5' : 'inset-y-0 items-center',
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} />
          </span>
        ) : null}
        {children}
      </span>
    </label>
  )
}

export function fieldClass(hasIcon?: boolean) {
  return cn('input-field', hasIcon && 'pl-11')
}
