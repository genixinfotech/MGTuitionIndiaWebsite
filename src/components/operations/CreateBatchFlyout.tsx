import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
  Layers,
  Loader2,
  Sparkles,
  UserRound,
  Users,
  Video,
  X,
} from 'lucide-react'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { useCurriculum, useGradesForSyllabus, useSubjectsForGrade } from '@/hooks/useCurriculum'
import {
  batchWeekdays,
  formatBatchDisplayName,
  heroByName,
  heroesForSubject,
  isBatchDisplayNameUsed,
  suggestHeroForSubject,
} from '@/lib/batch-heroes'
import {
  createBatch,
  defaultBatchMaxStudents,
  defaultBatchMinStudents,
  listBatchNames,
  type Batch,
} from '@/lib/batches'
import { listQualityManagers, type StaffOption } from '@/lib/staff'
import { classTimings } from '@/lib/tuition-plans'
import { listTutors } from '@/lib/tutors'
import type { Profile } from '@/lib/database.types'

type BatchForm = {
  syllabus: string
  grade: string
  subject: string
  heroName: string
  heroFullName: string
  startDate: string
  daysOfWeek: number[]
  timingIndex: number
  minStudents: number
  maxStudents: number
  qualityManagerId: string
  tutorId: string
  meetingLink: string
  notes: string
}

const emptyForm: BatchForm = {
  syllabus: '',
  grade: '',
  subject: '',
  heroName: '',
  heroFullName: '',
  startDate: '',
  daysOfWeek: [],
  timingIndex: 0,
  minStudents: defaultBatchMinStudents,
  maxStudents: defaultBatchMaxStudents,
  qualityManagerId: '',
  tutorId: '',
  meetingLink: '',
  notes: '',
}

function isValidMeetingLink(value: string) {
  return /^https?:\/\/.+/i.test(value.trim())
}

function toggleDay(days: number[], day: number) {
  return days.includes(day) ? days.filter((value) => value !== day) : [...days, day]
}

export function CreateBatchFlyout({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (batch: Batch) => void
}) {
  const [form, setForm] = useState(emptyForm)
  const [usedNames, setUsedNames] = useState<string[]>([])
  const [qualityManagers, setQualityManagers] = useState<StaffOption[]>([])
  const [tutors, setTutors] = useState<Profile[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { syllabi } = useCurriculum()
  const { grades: gradesForSyllabus } = useGradesForSyllabus(form.syllabus)
  const { subjects, loading: subjectsLoading } = useSubjectsForGrade(form.grade, form.syllabus)

  const subjectHeroes = useMemo(
    () => (form.subject ? heroesForSubject(form.subject) : []),
    [form.subject],
  )

  const selectedSlot = classTimings[form.timingIndex] ?? classTimings[0]

  const previewBatchName = useMemo(() => {
    if (!form.grade || !form.syllabus || !form.heroName || !selectedSlot) return ''
    return formatBatchDisplayName({
      grade: form.grade,
      syllabus: form.syllabus,
      heroName: form.heroName,
      startTime: selectedSlot.start,
    })
  }, [form.grade, form.heroName, form.syllabus, selectedSlot])

  const previewNameTaken = previewBatchName
    ? isBatchDisplayNameUsed(previewBatchName, usedNames)
    : false

  useEffect(() => {
    if (!open) return
    setForm(emptyForm)
    setError('')
    setLoadingOptions(true)

    let cancelled = false

    void Promise.all([listBatchNames(), listQualityManagers(), listTutors()])
      .then(([names, managers, tutorRows]) => {
        if (cancelled) return
        setUsedNames(names)
        setQualityManagers(managers)
        setTutors(tutorRows)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load batch creator options.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, saving, onClose])

  useEffect(() => {
    if (!form.subject || !form.grade || !form.syllabus || !selectedSlot) return
    setForm((current) => {
      if (current.heroName) {
        const hero = heroByName(current.heroName)
        if (hero && hero.subjects.includes(form.subject)) {
          const displayName = formatBatchDisplayName({
            grade: form.grade,
            syllabus: form.syllabus,
            heroName: current.heroName,
            startTime: selectedSlot.start,
          })
          if (!isBatchDisplayNameUsed(displayName, usedNames)) return current
        }
      }
      const suggested = suggestHeroForSubject(form.subject, usedNames, {
        grade: form.grade,
        syllabus: form.syllabus,
        startTime: selectedSlot.start,
      })
      if (!suggested) {
        return { ...current, heroName: '', heroFullName: '' }
      }
      return { ...current, heroName: suggested.name, heroFullName: suggested.fullName }
    })
  }, [form.subject, form.grade, form.syllabus, selectedSlot, usedNames])

  function patchForm(patch: Partial<BatchForm>) {
    setForm((current) => {
      const next = { ...current, ...patch }
      if (patch.syllabus !== undefined && patch.syllabus !== current.syllabus) {
        next.grade = ''
        next.subject = ''
        next.heroName = ''
        next.heroFullName = ''
      }
      if (patch.grade !== undefined && patch.grade !== current.grade) {
        next.subject = ''
        next.heroName = ''
        next.heroFullName = ''
      }
      if (patch.subject !== undefined && patch.subject !== current.subject) {
        next.heroName = ''
        next.heroFullName = ''
      }
      return next
    })
  }

  function selectHero(name: string, fullName: string) {
    patchForm({ heroName: name, heroFullName: fullName })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!form.heroName.trim()) {
      setError('Choose a batch hero for this subject.')
      return
    }
    if (form.daysOfWeek.length === 0) {
      setError('Select at least one class day.')
      return
    }
    if (!form.qualityManagerId) {
      setError('Assign a quality manager.')
      return
    }
    if (!form.tutorId) {
      setError('Assign a tutor.')
      return
    }
    if (!form.meetingLink.trim()) {
      setError('Enter the online class meeting link.')
      return
    }
    if (!isValidMeetingLink(form.meetingLink)) {
      setError('Meeting link must start with http:// or https://')
      return
    }
    if (form.minStudents < 1) {
      setError('Minimum students must be at least 1.')
      return
    }
    if (form.maxStudents < form.minStudents) {
      setError('Maximum students must be greater than or equal to minimum students.')
      return
    }
    if (!previewBatchName) {
      setError('Complete syllabus, grade, hero, and class time to preview the batch name.')
      return
    }
    if (previewNameTaken) {
      setError(`Batch name "${previewBatchName}" is already in use. Change the hero or time slot.`)
      return
    }

    const slot = classTimings[form.timingIndex]
    if (!slot) {
      setError('Choose a class time slot.')
      return
    }

    setSaving(true)
    try {
      const batch = await createBatch({
        name: previewBatchName,
        hero_full_name: form.heroFullName.trim(),
        subject: form.subject.trim(),
        syllabus: form.syllabus.trim(),
        grade: form.grade.trim(),
        start_date: form.startDate,
        days_of_week: form.daysOfWeek,
        start_time: slot.start,
        end_time: slot.end,
        quality_manager_id: form.qualityManagerId,
        tutor_id: form.tutorId,
        min_students: form.minStudents,
        max_students: form.maxStudents,
        meeting_link: form.meetingLink.trim(),
        notes: form.notes.trim() || undefined,
      })
      onCreated(batch)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create this batch.')
    } finally {
      setSaving(false)
    }
  }

  const selectedHero = form.heroName ? heroByName(form.heroName) : null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="create-batch"
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm disabled:cursor-not-allowed"
            aria-label="Close create batch panel"
            disabled={saving}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-batch-title"
            className="fixed top-0 right-0 flex h-dvh w-full max-w-lg flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
              <div>
                <div className="flex items-center gap-2 font-bold text-charcoal">
                  <Layers className="h-5 w-5 text-crimson" />
                  <h2 id="create-batch-title">Create batch</h2>
                </div>
                <p className="mt-1 text-sm text-charcoal/50">
                  Name the batch after a subject hero and set syllabus, grade, schedule, and staff.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 transition-colors hover:border-crimson/30 hover:text-crimson disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {loadingOptions ? (
                  <p className="flex items-center gap-2 text-sm text-charcoal/50">
                    <Loader2 className="h-4 w-4 animate-spin text-crimson" />
                    Loading options…
                  </p>
                ) : null}

                <FormField label="Syllabus" icon={BookOpen}>
                  <select
                    required
                    className={fieldClass(true)}
                    value={form.syllabus}
                    onChange={(event) => patchForm({ syllabus: event.target.value })}
                  >
                    <option value="">Select syllabus</option>
                    {syllabi.map((syllabus) => (
                      <option key={syllabus} value={syllabus}>
                        {syllabus}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Grade" icon={GraduationCap}>
                  <select
                    required
                    className={fieldClass(true)}
                    value={form.grade}
                    disabled={!form.syllabus}
                    onChange={(event) => patchForm({ grade: event.target.value })}
                  >
                    <option value="">{form.syllabus ? 'Select grade' : 'Choose syllabus first'}</option>
                    {gradesForSyllabus.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Subject" icon={Sparkles}>
                  <select
                    required
                    className={fieldClass(true)}
                    value={form.subject}
                    disabled={!form.grade || subjectsLoading}
                    onChange={(event) => patchForm({ subject: event.target.value })}
                  >
                    <option value="">
                      {!form.grade
                        ? 'Choose grade first'
                        : subjectsLoading
                          ? 'Loading subjects…'
                          : subjects.length
                            ? 'Select subject'
                            : 'No subjects for this grade'}
                    </option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </FormField>

                <div>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
                    Batch hero
                  </span>
                  {!form.subject ? (
                    <p className="rounded-xl border border-dashed border-charcoal/15 px-4 py-3 text-sm text-charcoal/45">
                      Pick a subject to see matching heroes.
                    </p>
                  ) : subjectHeroes.length === 0 ? (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      No heroes are mapped to {form.subject}. Add one in the hero catalog first.
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {subjectHeroes.map((hero) => {
                        const displayName =
                          form.grade && form.syllabus && selectedSlot
                            ? formatBatchDisplayName({
                                grade: form.grade,
                                syllabus: form.syllabus,
                                heroName: hero.name,
                                startTime: selectedSlot.start,
                              })
                            : ''
                        const used = displayName ? isBatchDisplayNameUsed(displayName, usedNames) : false
                        const selected = form.heroName.toLowerCase() === hero.name.toLowerCase()
                        return (
                          <button
                            key={hero.name}
                            type="button"
                            disabled={used}
                            onClick={() => selectHero(hero.name, hero.fullName)}
                            className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                              selected
                                ? 'border-crimson bg-crimson/[0.06] ring-1 ring-crimson/20'
                                : used
                                  ? 'cursor-not-allowed border-charcoal/10 bg-charcoal/[0.03] opacity-50'
                                  : 'border-charcoal/10 hover:border-crimson/25 hover:bg-crimson/[0.03]'
                            }`}
                          >
                            <span className="block text-sm font-semibold text-charcoal">{hero.name}</span>
                            <span className="mt-0.5 block text-xs text-charcoal/50">{hero.fullName}</span>
                            {used ? (
                              <span className="mt-1 block text-[11px] font-medium uppercase tracking-wide text-charcoal/40">
                                Name already used
                              </span>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {selectedHero ? (
                    <p className="mt-2 text-xs text-charcoal/45">
                      Hero: <span className="font-semibold text-charcoal">{selectedHero.fullName}</span>
                    </p>
                  ) : null}
                </div>

                <div className="rounded-xl border border-charcoal/10 bg-charcoal/[0.02] px-4 py-3">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
                    Batch name preview
                  </span>
                  <p className="mt-1 text-base font-bold text-charcoal">
                    {previewBatchName || 'Pick syllabus, grade, hero, and time to preview'}
                  </p>
                  {previewNameTaken ? (
                    <p className="mt-1 text-xs font-medium text-crimson">
                      This batch name is already in use. Choose another hero or time slot.
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Min students">
                    <input
                      required
                      type="number"
                      min={1}
                      className={fieldClass()}
                      value={form.minStudents}
                      onChange={(event) =>
                        patchForm({ minStudents: Math.max(1, Number(event.target.value) || 1) })
                      }
                    />
                  </FormField>
                  <FormField label="Max students">
                    <input
                      required
                      type="number"
                      min={form.minStudents}
                      className={fieldClass()}
                      value={form.maxStudents}
                      onChange={(event) =>
                        patchForm({
                          maxStudents: Math.max(form.minStudents, Number(event.target.value) || form.minStudents),
                        })
                      }
                    />
                  </FormField>
                </div>

                <FormField label="Start date" icon={CalendarDays}>
                  <input
                    required
                    type="date"
                    className={fieldClass(true)}
                    value={form.startDate}
                    onChange={(event) => patchForm({ startDate: event.target.value })}
                  />
                </FormField>

                <div>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
                    Class days
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {batchWeekdays.map((day) => {
                      const active = form.daysOfWeek.includes(day.value)
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => patchForm({ daysOfWeek: toggleDay(form.daysOfWeek, day.value) })}
                          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                            active
                              ? 'bg-crimson text-white'
                              : 'border border-charcoal/15 text-charcoal/70 hover:border-crimson/30 hover:text-crimson'
                          }`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <FormField label="Class time" icon={Clock}>
                  <select
                    required
                    className={fieldClass(true)}
                    value={form.timingIndex}
                    onChange={(event) => patchForm({ timingIndex: Number(event.target.value) })}
                  >
                    {classTimings.map((slot, index) => (
                      <option key={`${slot.start}-${slot.end}`} value={index}>
                        {slot.start} – {slot.end}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Quality manager" icon={UserRound}>
                  <select
                    required
                    className={fieldClass(true)}
                    value={form.qualityManagerId}
                    onChange={(event) => patchForm({ qualityManagerId: event.target.value })}
                  >
                    <option value="">Select quality manager</option>
                    {qualityManagers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.full_name || manager.email}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Tutor" icon={Users}>
                  <select
                    required
                    className={fieldClass(true)}
                    value={form.tutorId}
                    onChange={(event) => patchForm({ tutorId: event.target.value })}
                  >
                    <option value="">Select tutor</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.full_name || tutor.email}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Meeting link" icon={Video}>
                  <input
                    required
                    type="url"
                    className={fieldClass(true)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={form.meetingLink}
                    onChange={(event) => patchForm({ meetingLink: event.target.value })}
                  />
                </FormField>

                <FormField label="Notes (optional)">
                  <textarea
                    rows={3}
                    className={`${fieldClass()} resize-none`}
                    placeholder="Any batch notes for operations…"
                    value={form.notes}
                    onChange={(event) => patchForm({ notes: event.target.value })}
                  />
                </FormField>

                {error ? (
                  <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="border-t border-charcoal/[0.06] px-5 py-4">
                <button
                  type="submit"
                  disabled={saving || loadingOptions || !previewBatchName || previewNameTaken}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating batch…
                    </>
                  ) : (
                    'Create batch'
                  )}
                </button>
              </div>
            </form>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
