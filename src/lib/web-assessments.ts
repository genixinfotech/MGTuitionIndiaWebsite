import { getSupabase } from '@/lib/supabase'
import type { AssessmentStatus, WebAssessmentRequest } from '@/lib/database.types'

export type WebAssessmentRequestDetails = WebAssessmentRequest & {
  assigned_expert: {
    id: string
    full_name: string
    email: string
  } | null
}

export async function listWebAssessmentRequests() {
  const { data, error } = await getSupabase()
    .from('web_assessment_requests')
    .select(
      `
      *,
      assigned_expert:profiles!assigned_expert_id (
        id,
        full_name,
        email
      )
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load website assessment requests.')
  return (data ?? []) as WebAssessmentRequestDetails[]
}

export async function assignWebAssessmentExpert(requestId: number, expertId: string | null) {
  const { error } = await getSupabase()
    .from('web_assessment_requests')
    .update({ assigned_expert_id: expertId })
    .eq('id', requestId)

  if (error) throw new Error(error.message || 'Unable to assign this subject expert.')
}

export async function updateWebAssessmentStatus(id: number, status: AssessmentStatus) {
  const { error } = await getSupabase()
    .from('web_assessment_requests')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message || 'Unable to update this request.')
}
