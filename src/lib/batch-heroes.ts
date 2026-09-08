export type BatchHero = {
  name: string
  fullName: string
  field: string
  subjects: string[]
}

export const batchHeroes: BatchHero[] = [
  { name: 'Raman', fullName: 'C. V. Raman', field: 'Physics', subjects: ['Physics', 'Science'] },
  { name: 'Chandra', fullName: 'Subrahmanyan Chandrasekhar', field: 'Physics', subjects: ['Physics'] },
  { name: 'Einstein', fullName: 'Albert Einstein', field: 'Physics', subjects: ['Physics', 'Science'] },
  { name: 'Curie', fullName: 'Marie Curie', field: 'Chemistry', subjects: ['Chemistry', 'Science'] },
  { name: 'Pauling', fullName: 'Linus Pauling', field: 'Chemistry', subjects: ['Chemistry'] },
  { name: 'Khorana', fullName: 'Har Gobind Khorana', field: 'Biology', subjects: ['Biology', 'Science'] },
  { name: 'Watson', fullName: 'James Watson', field: 'Biology', subjects: ['Biology'] },
  { name: 'Crick', fullName: 'Francis Crick', field: 'Biology', subjects: ['Biology'] },
  { name: 'Nash', fullName: 'John Nash', field: 'Mathematics', subjects: ['Mathematics'] },
  { name: 'Ramanujan', fullName: 'Srinivasa Ramanujan', field: 'Mathematics', subjects: ['Mathematics'] },
  { name: 'Sen', fullName: 'Amartya Sen', field: 'Economics', subjects: ['Economics'] },
  { name: 'Tagore', fullName: 'Rabindranath Tagore', field: 'Literature', subjects: ['English'] },
  { name: 'Darwin', fullName: 'Charles Darwin', field: 'Natural Science', subjects: ['Biology', 'Science'] },
  { name: 'Faraday', fullName: 'Michael Faraday', field: 'Physics', subjects: ['Physics', 'Science'] },
  { name: 'Tesla', fullName: 'Nikola Tesla', field: 'Physics', subjects: ['Physics'] },
]

export function heroesForSubject(subject: string) {
  const normalized = subject.trim()
  return batchHeroes.filter((hero) => hero.subjects.includes(normalized))
}

export function suggestHeroForSubject(
  subject: string,
  usedNames: string[],
  preview?: {
    grade: string
    syllabus: string
    startTime: string
  },
) {
  const heroes = heroesForSubject(subject)
  if (!preview?.grade || !preview.syllabus || !preview.startTime) {
    return heroes[0] ?? null
  }

  return (
    heroes.find(
      (hero) =>
        !isBatchDisplayNameUsed(
          formatBatchDisplayName({
            grade: preview.grade,
            syllabus: preview.syllabus,
            heroName: hero.name,
            startTime: preview.startTime,
          }),
          usedNames,
        ),
    ) ?? null
  )
}

export function heroByName(name: string) {
  return batchHeroes.find((hero) => hero.name.toLowerCase() === name.trim().toLowerCase()) ?? null
}

export function heroNameFromBatch(batch: { name: string; hero_full_name: string }) {
  const byFullName = batchHeroes.find(
    (hero) => hero.fullName.toLowerCase() === batch.hero_full_name.trim().toLowerCase(),
  )
  if (byFullName) return byFullName.name

  const byNameInTitle = batchHeroes.find((hero) =>
    batch.name.toLowerCase().includes(` ${hero.name.toLowerCase()} `),
  )
  if (byNameInTitle) return byNameInTitle.name

  return ''
}

const syllabusShortLabels: Record<string, string> = {
  CBSE: 'CBSE',
  'ICSE / ISC': 'ICSE',
  'IGCSE Syllabus': 'IGCSE',
  'Other State Board': 'Other',
}

export function syllabusShortLabel(syllabus: string) {
  const trimmed = syllabus.trim()
  return syllabusShortLabels[trimmed] ?? trimmed
}

export function gradeNumberFromLabel(grade: string) {
  const match = grade.trim().match(/(\d+)/)
  return match?.[1] ?? grade.trim()
}

export function formatBatchStartTime(startTime: string) {
  return startTime.replace(/\s+/g, '').toLowerCase()
}

export function formatBatchDisplayName(input: {
  grade: string
  syllabus: string
  heroName: string
  startTime: string
}) {
  const grade = gradeNumberFromLabel(input.grade)
  const syllabus = syllabusShortLabel(input.syllabus)
  const hero = input.heroName.trim()
  const time = formatBatchStartTime(input.startTime)
  return `${grade} ${syllabus} ${hero} - ${time}`
}

export function isBatchDisplayNameUsed(displayName: string, usedNames: string[]) {
  const normalized = displayName.trim().toLowerCase()
  return usedNames.some((name) => name.trim().toLowerCase() === normalized)
}

export const batchWeekdays = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
] as const

export function formatBatchDays(days: number[]) {
  const labels = new Map<number, string>(batchWeekdays.map((day) => [day.value, day.label]))
  return [...days]
    .sort((a, b) => {
      const order = (value: number) => (value === 0 ? 7 : value)
      return order(a) - order(b)
    })
    .map((day) => labels.get(day) ?? String(day))
    .join(', ')
}

export function formatBatchSchedule(input: {
  days_of_week: number[]
  start_time: string
  end_time: string
  start_date: string
}) {
  const start = new Date(`${input.start_date}T00:00:00`)
  const dateLabel = Number.isNaN(start.getTime())
    ? input.start_date
    : start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${formatBatchDays(input.days_of_week)} · ${input.start_time}–${input.end_time} · from ${dateLabel}`
}
