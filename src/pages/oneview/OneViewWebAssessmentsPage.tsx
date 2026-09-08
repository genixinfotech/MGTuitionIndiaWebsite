import { useEffect, useMemo, useState } from 'react'
import { Globe } from 'lucide-react'
import { WebAssessmentQueue, type WebAssessmentPatch } from '@/components/dashboard/WebAssessmentQueue'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { listSubjectExperts, type SubjectExpertOption } from '@/lib/subject-experts'
import { listWebAssessmentRequests, type WebAssessmentRequestDetails } from '@/lib/web-assessments'

export function OneViewWebAssessmentsPage() {
  const [webAssessments, setWebAssessments] = useState<WebAssessmentRequestDetails[]>([])
  const [subjectExperts, setSubjectExperts] = useState<SubjectExpertOption[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [nextWebAssessments, experts] = await Promise.all([
          listWebAssessmentRequests(),
          listSubjectExperts(),
        ])
        if (cancelled) return
        setWebAssessments(nextWebAssessments)
        setSubjectExperts(experts)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load assessment requests.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const newWebAssessments = useMemo(
    () => webAssessments.filter((row) => row.status === 'new').length,
    [webAssessments],
  )

  function onWebAssessmentChange(id: number, patch: WebAssessmentPatch) {
    setWebAssessments((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title="Assessment Requests (Web)" />
      <p className="-mt-2 text-sm text-charcoal/55">
        Submitted from the public booking form before sign-up. Enrol the family in the portal before
        preparing reports or tuition subjects.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <StatCard icon={Globe} label="New requests" value={loading ? '—' : String(newWebAssessments)} />
        <StatCard icon={Globe} label="All requests" value={loading ? '—' : String(webAssessments.length)} />
      </div>

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">{error}</p>
      ) : null}

      <WebAssessmentQueue
        rows={webAssessments}
        subjectExperts={subjectExperts}
        loading={loading}
        onChange={onWebAssessmentChange}
        onError={setError}
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-charcoal/[0.06] bg-white p-5">
      <Icon className="h-5 w-5 text-crimson" />
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
      <p className="text-sm text-charcoal/50">{label}</p>
    </div>
  )
}
