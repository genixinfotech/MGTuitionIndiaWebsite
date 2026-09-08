import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Briefcase,
  Building2,
  GraduationCap,
  IdCard,
  Loader2,
  Pencil,
} from 'lucide-react'
import {
  EditTutorBankDetailsFlyout,
  EditTutorPanDetailsFlyout,
  EditTutorQualificationsFlyout,
  EditTutorSpecializationsFlyout,
  EditTutorTeachingExperienceFlyout,
  bankFormFromDetails,
  emptyBankForm,
  emptyPanForm,
  experienceFormFromDetails,
  hasBankDetails,
  hasPanDetails,
  loadTutorProfileDetails,
  panFormFromDetails,
  qualificationsFormFromDetails,
  specializationsFormFromDetails,
} from '@/components/tutor/EditTutorProfileFlyouts'
import {
  formatExperienceLine,
  formatPanDate,
  formatQualificationYears,
  formatSpecializationLine,
} from '@/lib/tutor-profile'
import type { TutorProfileDetails, TutorVerificationStatus } from '@/lib/database.types'
import { cn } from '@/lib/utils'

function VerificationBadge({ status }: { status: TutorVerificationStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
        status === 'verified' && 'bg-emerald-50 text-emerald-700',
        status === 'rejected' && 'bg-crimson/10 text-crimson',
        status === 'pending' && 'bg-amber-50 text-amber-800',
      )}
    >
      {status === 'verified'
        ? 'Verified'
        : status === 'rejected'
          ? 'Rejected'
          : 'Pending verification'}
    </span>
  )
}

function ProfileCard({
  title,
  icon: Icon,
  badge,
  onEdit,
  canEdit,
  children,
}: {
  title: string
  icon: LucideIcon
  badge?: React.ReactNode
  onEdit?: () => void
  canEdit?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal/[0.06] px-5 py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <Icon className="h-5 w-5 shrink-0 text-crimson" />
          <h3 className="font-bold text-charcoal">{title}</h3>
          {badge}
        </div>
        {canEdit && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 px-3 py-1.5 text-xs font-semibold text-charcoal/65 transition-colors hover:border-crimson/20 hover:text-crimson"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/45">{label}</p>
      <p className="mt-1 font-semibold text-charcoal">{value || '—'}</p>
    </div>
  )
}

export function TutorProfessionalProfilePanel({
  tutorId,
  canEdit = false,
}: {
  tutorId: string
  canEdit?: boolean
}) {
  const [details, setDetails] = useState<TutorProfileDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editBank, setEditBank] = useState(false)
  const [editPan, setEditPan] = useState(false)
  const [editSpecializations, setEditSpecializations] = useState(false)
  const [editExperience, setEditExperience] = useState(false)
  const [editQualifications, setEditQualifications] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const rows = await loadTutorProfileDetails(tutorId)
        if (!cancelled) setDetails(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load tutor profile details.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [tutorId])

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-charcoal/[0.06] bg-white py-16">
        <Loader2 className="h-5 w-5 animate-spin text-crimson" />
      </div>
    )
  }

  if (error || !details) {
    return (
      <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">
        {error || 'Unable to load tutor profile details.'}
      </p>
    )
  }

  const bankFilled = hasBankDetails(details.bank)
  const panFilled = hasPanDetails(details.pan)

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        <ProfileCard
          title="Bank Details"
          icon={Building2}
          badge={bankFilled ? <VerificationBadge status={details.bank!.verification_status} /> : null}
          canEdit={canEdit}
          onEdit={() => setEditBank(true)}
        >
          {bankFilled ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Bank Name" value={details.bank!.bank_name ?? '—'} />
              <InfoField label="Account Holder" value={details.bank!.account_holder_name ?? '—'} />
              <InfoField label="Account Number" value={details.bank!.account_number ?? '—'} />
              <InfoField label="IFSC Code" value={details.bank!.ifsc_code ?? '—'} />
              <InfoField label="Branch" value={details.bank!.branch ?? '—'} />
            </div>
          ) : (
            <p className="text-sm text-charcoal/45">
              {canEdit ? 'Add your bank details for payroll.' : 'Bank details not provided yet.'}
            </p>
          )}
        </ProfileCard>

        <ProfileCard
          title="PAN Details"
          icon={IdCard}
          badge={panFilled ? <VerificationBadge status={details.pan!.verification_status} /> : null}
          canEdit={canEdit}
          onEdit={() => setEditPan(true)}
        >
          {panFilled ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Employee Name" value={details.pan!.name_on_pan ?? '—'} />
              <InfoField
                label="Date of Birth (as on PAN)"
                value={formatPanDate(details.pan!.date_of_birth)}
              />
              <InfoField label="PAN Number" value={details.pan!.pan_number ?? '—'} />
            </div>
          ) : (
            <p className="text-sm text-charcoal/45">
              {canEdit ? 'Add your PAN details for verification.' : 'PAN details not provided yet.'}
            </p>
          )}
        </ProfileCard>

        <ProfileCard
          title="Specializations & Teaching Experience"
          icon={BookOpen}
          canEdit={canEdit}
          onEdit={() => setEditSpecializations(true)}
        >
          <div className="space-y-5">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-charcoal">Specializations</p>
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => setEditSpecializations(true)}
                    className="text-xs font-semibold text-crimson hover:text-crimson-dark"
                  >
                    Edit
                  </button>
                ) : null}
              </div>
              {details.specializations.length === 0 ? (
                <p className="text-sm text-charcoal/45">No specializations listed yet.</p>
              ) : (
                <ul className="space-y-2">
                  {details.specializations.map((row) => (
                    <li key={row.id} className="flex items-start gap-2 text-sm font-medium text-charcoal">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                      <span>{formatSpecializationLine(row)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-charcoal/[0.06] pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-charcoal/45" />
                  <p className="text-sm font-bold text-charcoal">Teaching Experience</p>
                </div>
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => setEditExperience(true)}
                    className="text-xs font-semibold text-crimson hover:text-crimson-dark"
                  >
                    Edit
                  </button>
                ) : null}
              </div>
              {details.experience.length === 0 ? (
                <p className="text-sm text-charcoal/45">No teaching experience listed yet.</p>
              ) : (
                <ul className="space-y-2">
                  {details.experience.map((row) => (
                    <li key={row.id} className="flex items-start gap-2 text-sm font-medium text-charcoal">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                      <span>{formatExperienceLine(row)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </ProfileCard>

        <ProfileCard
          title="Qualifications"
          icon={GraduationCap}
          canEdit={canEdit}
          onEdit={() => setEditQualifications(true)}
        >
          {details.qualifications.length === 0 ? (
            <p className="text-sm text-charcoal/45">
              {canEdit ? 'Add your academic qualifications.' : 'No qualifications listed yet.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {details.qualifications.map((row) => (
                <li key={row.id} className="flex gap-3">
                  <span className="mt-1 w-1 shrink-0 rounded-full bg-violet-500" />
                  <div>
                    <p className="font-extrabold uppercase tracking-wide text-charcoal">
                      {row.degree_title}
                    </p>
                    <p className="mt-1 text-sm font-medium uppercase text-charcoal/60">
                      {[row.institution, formatQualificationYears(row)].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ProfileCard>
      </div>

      {canEdit ? (
        <>
          <EditTutorBankDetailsFlyout
            open={editBank}
            onClose={() => setEditBank(false)}
            initial={bankFilled ? bankFormFromDetails(details.bank) : emptyBankForm()}
            onSaved={(bank) => setDetails((current) => (current ? { ...current, bank } : current))}
          />
          <EditTutorPanDetailsFlyout
            open={editPan}
            onClose={() => setEditPan(false)}
            initial={panFilled ? panFormFromDetails(details.pan) : emptyPanForm()}
            onSaved={(pan) => setDetails((current) => (current ? { ...current, pan } : current))}
          />
          <EditTutorSpecializationsFlyout
            open={editSpecializations}
            onClose={() => setEditSpecializations(false)}
            initial={specializationsFormFromDetails(details)}
            onSaved={(specializations) =>
              setDetails((current) => (current ? { ...current, specializations } : current))
            }
          />
          <EditTutorTeachingExperienceFlyout
            open={editExperience}
            onClose={() => setEditExperience(false)}
            initial={experienceFormFromDetails(details)}
            onSaved={(experience) =>
              setDetails((current) => (current ? { ...current, experience } : current))
            }
          />
          <EditTutorQualificationsFlyout
            open={editQualifications}
            onClose={() => setEditQualifications(false)}
            initial={qualificationsFormFromDetails(details)}
            onSaved={(qualifications) =>
              setDetails((current) => (current ? { ...current, qualifications } : current))
            }
          />
        </>
      ) : null}
    </>
  )
}
