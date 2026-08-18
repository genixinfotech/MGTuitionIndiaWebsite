import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, FileText, Loader2, X } from 'lucide-react'
import { formatPreferredSlot, getAssessmentReportUrl } from '@/lib/assessments'

export function AssessmentReportModal({
  open,
  studentName,
  preferredDate,
  preferredTime,
  report,
  reportPath,
  onClose,
}: {
  open: boolean
  studentName: string
  preferredDate?: string | null
  preferredTime?: string | null
  report: string | null
  reportPath?: string | null
  onClose: () => void
}) {
  const slot = formatPreferredSlot(preferredDate, preferredTime)
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !reportPath) {
      setUrl(null)
      setError('')
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    void getAssessmentReportUrl(reportPath)
      .then((signed) => {
        if (!cancelled) setUrl(signed)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to open this report.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, reportPath])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
            aria-label="Close report"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assessment-report-title"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 flex max-h-[min(92vh,860px)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)]"
          >
            <div className="relative shrink-0 bg-gradient-to-r from-crimson via-[#e63946] to-crimson-dark px-6 py-6 text-white">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
                Assessment report
              </p>
              <h2 id="assessment-report-title" className="mt-2 text-2xl font-extrabold tracking-tight">
                {studentName}
              </h2>
              {slot !== '—' ? <p className="mt-1 text-sm text-white/80">{slot}</p> : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {loading ? (
                <div className="flex min-h-64 items-center justify-center text-charcoal/50">
                  <Loader2 className="h-6 w-6 animate-spin text-crimson" />
                </div>
              ) : url ? (
                <iframe
                  title={`${studentName} assessment report`}
                  src={url}
                  className="h-[min(62vh,560px)] w-full rounded-2xl border border-charcoal/10 bg-[#f8fafc]"
                />
              ) : report?.trim() ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-charcoal/75">{report}</p>
              ) : (
                <div className="rounded-2xl border border-dashed border-charcoal/15 bg-[#f8fafc] px-4 py-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-charcoal/30" />
                  <p className="mt-3 text-sm text-charcoal/55">
                    {error ||
                      'The student consultant is preparing this report. It will appear here once it is ready.'}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 border-t border-charcoal/[0.06] px-6 py-4">
              {url ? (
                <a href={url} target="_blank" rel="noreferrer" className="btn-outline flex-1">
                  <ExternalLink className="h-4 w-4" />
                  Open PDF
                </a>
              ) : null}
              <button type="button" onClick={onClose} className="btn-primary flex-1">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
