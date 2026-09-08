export const alphabetFilters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] as const

export type LetterFilter = 'all' | (typeof alphabetFilters)[number]

export function nameInitial(name?: string | null): LetterFilter | null {
  const trimmed = (name || '').trim()
  if (!trimmed) return null
  const letter = trimmed[0]?.toUpperCase()
  if (!letter || !/[A-Z]/.test(letter)) return null
  return letter as LetterFilter
}

export function matchesLetterFilter(name: string | null | undefined, letter: LetterFilter) {
  if (letter === 'all') return true
  return nameInitial(name) === letter
}

export function uniqueSorted(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])].sort((a, b) =>
    a.localeCompare(b, 'en-IN'),
  )
}

export type OneViewFilterOption = {
  value: string
  label: string
}

export type OneViewFilterConfig = {
  id: string
  label: string
  value: string
  options: OneViewFilterOption[]
  onChange: (value: string) => void
}
