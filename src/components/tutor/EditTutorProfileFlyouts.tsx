import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { fieldClass } from '@/components/forms/FormField'
import {
  getTutorProfileDetails,
  hasBankDetails,
  hasPanDetails,
  type BankDetailsInput,
  type PanDetailsInput,
  type QualificationInput,
  type SpecializationInput,
  type TeachingExperienceInput,
  upsertTutorBankDetails,
  upsertTutorPanDetails,
  replaceTutorQualifications,
  replaceTutorSpecializations,
  replaceTutorTeachingExperience,
} from '@/lib/tutor-profile'
import type { TutorProfileDetails } from '@/lib/database.types'

function FlyoutShell({
  open,
  title,
  description,
  saving,
  error,
  onClose,
  onSave,
  children,
}: {
  open: boolean
  title: string
  description?: string
  saving: boolean
  error: string
  onClose: () => void
  onSave: () => void
  children: ReactNode
}) {
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

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm disabled:cursor-not-allowed"
            aria-label="Close panel"
            disabled={saving}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="fixed top-0 right-0 flex h-dvh w-full max-w-xl flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
              <div>
                <h2 className="text-lg font-bold text-charcoal">{title}</h2>
                {description ? <p className="mt-1 text-sm text-charcoal/50">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 transition-colors hover:border-crimson/30 hover:text-crimson disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

            <div className="border-t border-charcoal/[0.06] px-5 py-4">
              {error ? (
                <p className="mb-3 rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-full border border-charcoal/10 px-4 py-2.5 text-sm font-semibold text-charcoal/60 transition-colors hover:border-charcoal/20 hover:text-charcoal disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export function EditTutorBankDetailsFlyout({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: BankDetailsInput
  onSaved: (details: TutorProfileDetails['bank']) => void
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initial)
      setError('')
    }
  }, [initial, open])

  async function handleSave() {
    setError('')
    if (!form.bank_name.trim() || !form.account_holder_name.trim() || !form.account_number.trim()) {
      setError('Bank name, account holder, and account number are required.')
      return
    }

    setSaving(true)
    try {
      const bank = await upsertTutorBankDetails(form)
      onSaved(bank)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save bank details.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <FlyoutShell
      open={open}
      title="Edit Bank Details"
      saving={saving}
      error={error}
      onClose={onClose}
      onSave={() => void handleSave()}
    >
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-charcoal">Bank Name</span>
          <input
            className={fieldClass(true)}
            value={form.bank_name}
            onChange={(e) => setForm((current) => ({ ...current, bank_name: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-charcoal">Account Holder</span>
          <input
            className={fieldClass(true)}
            value={form.account_holder_name}
            onChange={(e) => setForm((current) => ({ ...current, account_holder_name: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-charcoal">Account Number</span>
          <input
            className={fieldClass(true)}
            value={form.account_number}
            onChange={(e) => setForm((current) => ({ ...current, account_number: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-charcoal">IFSC Code</span>
          <input
            className={fieldClass(true)}
            value={form.ifsc_code}
            onChange={(e) => setForm((current) => ({ ...current, ifsc_code: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-charcoal">Branch</span>
          <input
            className={fieldClass(true)}
            value={form.branch}
            onChange={(e) => setForm((current) => ({ ...current, branch: e.target.value }))}
          />
        </label>
      </div>
    </FlyoutShell>
  )
}

export function EditTutorPanDetailsFlyout({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: PanDetailsInput
  onSaved: (details: TutorProfileDetails['pan']) => void
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initial)
      setError('')
    }
  }, [initial, open])

  async function handleSave() {
    setError('')
    if (!form.name_on_pan.trim() || !form.date_of_birth || !form.pan_number.trim()) {
      setError('Name, date of birth, and PAN number are required.')
      return
    }

    setSaving(true)
    try {
      const pan = await upsertTutorPanDetails(form)
      onSaved(pan)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save PAN details.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <FlyoutShell
      open={open}
      title="Edit PAN Details"
      saving={saving}
      error={error}
      onClose={onClose}
      onSave={() => void handleSave()}
    >
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-charcoal">Employee Name</span>
          <input
            className={fieldClass(true)}
            value={form.name_on_pan}
            onChange={(e) => setForm((current) => ({ ...current, name_on_pan: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-charcoal">Date of Birth (as on PAN)</span>
          <input
            type="date"
            className={fieldClass(true)}
            value={form.date_of_birth}
            onChange={(e) => setForm((current) => ({ ...current, date_of_birth: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-charcoal">PAN Number</span>
          <input
            className={fieldClass(true)}
            value={form.pan_number}
            onChange={(e) => setForm((current) => ({ ...current, pan_number: e.target.value.toUpperCase() }))}
          />
        </label>
      </div>
    </FlyoutShell>
  )
}

function ListEditor<T extends Record<string, string>>({
  items,
  onChange,
  emptyLabel,
  makeEmpty,
  fields,
}: {
  items: T[]
  onChange: (items: T[]) => void
  emptyLabel: string
  makeEmpty: () => T
  fields: Array<{ key: keyof T; label: string; type?: string; placeholder?: string }>
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? <p className="text-sm text-charcoal/45">{emptyLabel}</p> : null}
      {items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-xl border border-charcoal/[0.08] bg-[#fcfbfa] p-4">
          {fields.map((field) => (
            <label key={String(field.key)} className="block text-sm">
              <span className="mb-1 block font-semibold text-charcoal">{field.label}</span>
              <input
                type={field.type ?? 'text'}
                className={fieldClass(true)}
                placeholder={field.placeholder}
                value={item[field.key]}
                onChange={(e) =>
                  onChange(
                    items.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, [field.key]: e.target.value } : row,
                    ),
                  )
                }
              />
            </label>
          ))}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, rowIndex) => rowIndex !== index))}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-crimson hover:text-crimson-dark"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, makeEmpty()])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-charcoal/10 px-3 py-2 text-sm font-semibold text-charcoal/70 transition-colors hover:border-crimson/20 hover:text-crimson"
      >
        <Plus className="h-4 w-4" />
        Add row
      </button>
    </div>
  )
}

export function EditTutorSpecializationsFlyout({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: SpecializationInput[]
  onSaved: (items: TutorProfileDetails['specializations']) => void
}) {
  const [items, setItems] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setItems(initial)
      setError('')
    }
  }, [initial, open])

  async function handleSave() {
    setError('')
    const cleaned = items.filter((item) => item.subject.trim() && item.grade_range.trim())
    setSaving(true)
    try {
      const rows = await replaceTutorSpecializations(cleaned)
      onSaved(rows)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save specializations.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <FlyoutShell
      open={open}
      title="Edit Specializations"
      saving={saving}
      error={error}
      onClose={onClose}
      onSave={() => void handleSave()}
    >
      <ListEditor
        items={items}
        onChange={setItems}
        emptyLabel="No specializations yet."
        makeEmpty={() => ({ subject: '', grade_range: '' })}
        fields={[
          { key: 'subject', label: 'Subject', placeholder: 'English' },
          { key: 'grade_range', label: 'Grade range', placeholder: 'GRADE 2-10' },
        ]}
      />
    </FlyoutShell>
  )
}

export function EditTutorTeachingExperienceFlyout({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: TeachingExperienceInput[]
  onSaved: (items: TutorProfileDetails['experience']) => void
}) {
  const [items, setItems] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setItems(initial)
      setError('')
    }
  }, [initial, open])

  async function handleSave() {
    setError('')
    const cleaned = items.filter((item) => item.organization.trim() && item.role_title.trim())
    setSaving(true)
    try {
      const rows = await replaceTutorTeachingExperience(cleaned)
      onSaved(rows)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save teaching experience.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <FlyoutShell
      open={open}
      title="Edit Teaching Experience"
      saving={saving}
      error={error}
      onClose={onClose}
      onSave={() => void handleSave()}
    >
      <ListEditor
        items={items}
        onChange={setItems}
        emptyLabel="No teaching experience added yet."
        makeEmpty={() => ({ organization: '', role_title: '', start_date: '', end_date: '' })}
        fields={[
          { key: 'organization', label: 'Organization', placeholder: 'School or institution name' },
          { key: 'role_title', label: 'Role', placeholder: 'Pre-School Teacher' },
          { key: 'start_date', label: 'Start date', type: 'date' },
          { key: 'end_date', label: 'End date', type: 'date' },
        ]}
      />
    </FlyoutShell>
  )
}

export function EditTutorQualificationsFlyout({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: QualificationInput[]
  onSaved: (items: TutorProfileDetails['qualifications']) => void
}) {
  const [items, setItems] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setItems(initial)
      setError('')
    }
  }, [initial, open])

  async function handleSave() {
    setError('')
    const cleaned = items.filter((item) => item.degree_title.trim() && item.institution.trim())
    setSaving(true)
    try {
      const rows = await replaceTutorQualifications(cleaned)
      onSaved(rows)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save qualifications.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <FlyoutShell
      open={open}
      title="Edit Qualifications"
      saving={saving}
      error={error}
      onClose={onClose}
      onSave={() => void handleSave()}
    >
      <ListEditor
        items={items}
        onChange={setItems}
        emptyLabel="No qualifications added yet."
        makeEmpty={() => ({ degree_title: '', institution: '', year_from: '', year_to: '' })}
        fields={[
          { key: 'degree_title', label: 'Degree / qualification', placeholder: 'B A ENGLISH' },
          { key: 'institution', label: 'Institution', placeholder: 'College or university name' },
          { key: 'year_from', label: 'Year from', placeholder: '2012' },
          { key: 'year_to', label: 'Year to', placeholder: '2015' },
        ]}
      />
    </FlyoutShell>
  )
}

export function emptyBankForm(): BankDetailsInput {
  return {
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    branch: '',
  }
}

export function emptyPanForm(): PanDetailsInput {
  return {
    name_on_pan: '',
    date_of_birth: '',
    pan_number: '',
  }
}

export function bankFormFromDetails(bank: TutorProfileDetails['bank']): BankDetailsInput {
  return {
    bank_name: bank?.bank_name ?? '',
    account_holder_name: bank?.account_holder_name ?? '',
    account_number: bank?.account_number ?? '',
    ifsc_code: bank?.ifsc_code ?? '',
    branch: bank?.branch ?? '',
  }
}

export function panFormFromDetails(pan: TutorProfileDetails['pan']): PanDetailsInput {
  return {
    name_on_pan: pan?.name_on_pan ?? '',
    date_of_birth: pan?.date_of_birth ?? '',
    pan_number: pan?.pan_number ?? '',
  }
}

export function specializationsFormFromDetails(details: TutorProfileDetails) {
  return details.specializations.map((row) => ({
    subject: row.subject,
    grade_range: row.grade_range,
  }))
}

export function experienceFormFromDetails(details: TutorProfileDetails) {
  return details.experience.map((row) => ({
    organization: row.organization,
    role_title: row.role_title,
    start_date: row.start_date ?? '',
    end_date: row.end_date ?? '',
  }))
}

export function qualificationsFormFromDetails(details: TutorProfileDetails) {
  return details.qualifications.map((row) => ({
    degree_title: row.degree_title,
    institution: row.institution,
    year_from: row.year_from ? String(row.year_from) : '',
    year_to: row.year_to ? String(row.year_to) : '',
  }))
}

export async function loadTutorProfileDetails(tutorId: string) {
  return getTutorProfileDetails(tutorId)
}

export { hasBankDetails, hasPanDetails }
