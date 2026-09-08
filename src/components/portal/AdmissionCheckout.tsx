import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CreditCard,
  Loader2,
  MessageCircle,
  Phone,
  QrCode,
  UserRound,
  X,
} from 'lucide-react'
import { formatInr } from '@/lib/tuition-plans'
import { site } from '@/lib/site'
import {
  consultantWhatsappUrl,
  listStudentConsultants,
  type StudentConsultantContact,
} from '@/lib/student-consultants'
import type { Student, StudentSubject } from '@/lib/database.types'

function formatPhoneDisplay(phone?: string | null) {
  if (!phone?.trim()) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  return phone
}

function buildReceiptMessage(input: {
  consultantName: string
  studentName: string
  amount: number
  subjects: string[]
}) {
  return [
    `Hi ${input.consultantName},`,
    '',
    `I have paid the admission fee for ${input.studentName}.`,
    `Amount: ${formatInr(input.amount)}`,
    `Subjects: ${input.subjects.join(', ')}`,
    '',
    'Please find my payment receipt attached in this chat.',
    '',
    'Thank you.',
  ].join('\n')
}

function StudentConsultantCard({
  consultant,
  loading,
}: {
  consultant: StudentConsultantContact | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-charcoal/[0.08] bg-gray-50 px-4 py-4">
        <Loader2 className="h-5 w-5 animate-spin text-crimson" />
        <p className="text-sm text-charcoal/55">Loading your student consultant…</p>
      </div>
    )
  }

  if (!consultant) {
    return (
      <div className="rounded-2xl border border-dashed border-charcoal/15 bg-gray-50 px-4 py-4 text-sm text-charcoal/55">
        Your student consultant details will appear here shortly. You can also reach us on{' '}
        <a href={site.phoneHref} className="font-semibold text-crimson">
          {site.phoneDisplay}
        </a>
        .
      </div>
    )
  }

  const initial = (consultant.full_name.trim().charAt(0) || 'S').toUpperCase()
  const phoneDisplay = formatPhoneDisplay(consultant.phone)

  return (
    <div className="overflow-hidden rounded-[22px] border border-crimson/15 bg-gradient-to-br from-white via-rose-50/40 to-crimson/[0.05] shadow-[0_16px_40px_-28px_rgba(204,0,0,0.45)]">
      <div className="border-b border-crimson/10 bg-crimson px-4 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
          Your student consultant
        </p>
      </div>
      <div className="flex items-start gap-4 px-4 py-4">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-crimson text-xl font-extrabold text-white shadow-[0_10px_24px_-12px_rgba(204,0,0,0.8)]">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold tracking-tight text-charcoal">{consultant.full_name}</p>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-crimson">
            Student Consultant
          </p>
          {phoneDisplay ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-charcoal/75">
              <Phone className="h-4 w-4 text-crimson" />
              WhatsApp {phoneDisplay}
            </p>
          ) : null}
          {consultant.email ? (
            <p className="mt-1 truncate text-xs text-charcoal/45">{consultant.email}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function AdmissionCheckout({
  student,
  subjects,
  onClose,
  onPaid: _onPaid,
  onError: _onError,
  renewal = false,
}: {
  student: Student | null
  parentId: string
  subjects: StudentSubject[]
  onClose: () => void
  onPaid?: (row: import('@/lib/database.types').Admission) => void
  onError?: (message: string) => void
  renewal?: boolean
}) {
  const [consultant, setConsultant] = useState<StudentConsultantContact | null>(null)
  const [loadingConsultant, setLoadingConsultant] = useState(false)
  const amount = subjects.reduce((sum, row) => sum + row.monthly_rate, 0)
  const subjectNames = useMemo(() => subjects.map((item) => item.subject), [subjects])

  useEffect(() => {
    if (!student) return
    let cancelled = false
    setLoadingConsultant(true)
    void listStudentConsultants()
      .then((rows) => {
        if (!cancelled) setConsultant(rows[0] ?? null)
      })
      .catch(() => {
        if (!cancelled) setConsultant(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingConsultant(false)
      })
    return () => {
      cancelled = true
    }
  }, [student])

  useEffect(() => {
    if (!student) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [student, onClose])

  const receiptWhatsappUrl = useMemo(() => {
    if (!student || !consultant) return null
    return consultantWhatsappUrl(
      consultant,
      buildReceiptMessage({
        consultantName: consultant.full_name.split(' ')[0] || consultant.full_name,
        studentName: student.full_name,
        amount,
        subjects: subjectNames,
      }),
      site.whatsappNumber,
    )
  }, [student, consultant, amount, subjectNames])

  return createPortal(
    <AnimatePresence>
      {student ? (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
            aria-label="Close payment"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="admission-title"
            className="fixed top-0 right-0 flex h-dvh w-full max-w-md flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-crimson">
                  Make payment · {student.full_name}
                </p>
                <h2 id="admission-title" className="mt-1 text-lg font-bold text-charcoal">
                  {subjectNames.length === 1
                    ? subjectNames[0]
                    : `${subjectNames.length} subjects`}
                </h2>
                <p className="mt-1 text-sm text-charcoal/50">
                  {renewal
                    ? subjectNames.length === 1
                      ? `Pay the next month for ${subjectNames[0]} by UPI, then send your receipt to your student consultant on WhatsApp.`
                      : `Pay the next month for ${subjectNames.join(', ')} by UPI, then send your receipt to your student consultant on WhatsApp.`
                    : subjectNames.length === 1
                      ? `Pay the first month for ${subjectNames[0]} by UPI, then send your receipt to your student consultant on WhatsApp.`
                      : `Pay the first month for ${subjectNames.join(', ')} by UPI, then send your receipt to your student consultant on WhatsApp.`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 hover:text-crimson"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <div className="space-y-2">
                {subjects.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-charcoal">{row.subject}</p>
                    <p className="text-sm font-bold text-charcoal">{formatInr(row.monthly_rate)}</p>
                  </div>
                ))}
                <div className="rounded-2xl border border-crimson/15 bg-crimson/[0.04] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal/40">
                    {renewal ? 'Next month total' : 'First month total'}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-charcoal">{formatInr(amount)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-charcoal/[0.08] bg-white px-4 py-4">
                <div className="flex items-center gap-2 font-semibold text-charcoal">
                  <QrCode className="h-4 w-4 text-crimson" />
                  Pay by UPI
                </div>
                <p className="mt-1 text-sm text-charcoal/50">
                  Scan the QR code below and pay {formatInr(amount)}. A payment gateway will be added
                  here soon.
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="rounded-2xl border border-charcoal/[0.08] bg-white p-3 shadow-sm">
                    <img
                      src={site.paymentUpiQr}
                      alt="UPI payment QR code"
                      className="h-52 w-52 object-contain"
                    />
                  </div>
                </div>
                {site.paymentUpiId ? (
                  <p className="mt-3 text-center text-sm font-semibold text-charcoal/70">
                    UPI ID: <span className="text-charcoal">{site.paymentUpiId}</span>
                  </p>
                ) : null}
              </div>

              <StudentConsultantCard consultant={consultant} loading={loadingConsultant} />
            </div>

            <div className="border-t border-charcoal/[0.06] px-5 py-4">
              {receiptWhatsappUrl ? (
                <a
                  href={receiptWhatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send receipt on WhatsApp
                </a>
              ) : (
                <button type="button" disabled className="btn-primary w-full opacity-60">
                  <MessageCircle className="h-4 w-4" />
                  Send receipt on WhatsApp
                </button>
              )}
              <p className="mt-3 flex items-start gap-2 text-[11px] leading-snug text-charcoal/45">
                <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-crimson" />
                After paying, open WhatsApp and attach your UPI payment screenshot or receipt. Your
                consultant will confirm admission once payment is verified.
              </p>
              <p className="mt-2 flex items-start gap-2 text-[11px] leading-snug text-charcoal/45">
                <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-crimson" />
                Card and net banking checkout will be available soon.
              </p>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
