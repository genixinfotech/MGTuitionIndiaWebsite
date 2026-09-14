import { getSupabase } from '@/lib/supabase'

export type PaymentModel = 'one_time' | 'subscription'

export type AppSettings = {
  id: number
  payment_model: PaymentModel
  updated_at: string
  updated_by: string | null
}

export function isPaymentModel(value: unknown): value is PaymentModel {
  return value === 'one_time' || value === 'subscription'
}

export async function loadAppSettings() {
  const { data, error } = await getSupabase()
    .from('app_settings')
    .select('id, payment_model, updated_at, updated_by')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw new Error(error.message || 'Unable to load settings.')
  return (data ?? {
    id: 1,
    payment_model: 'one_time',
    updated_at: new Date().toISOString(),
    updated_by: null,
  }) as AppSettings
}

export async function savePaymentModel(paymentModel: PaymentModel, updatedBy: string) {
  const { data, error } = await getSupabase()
    .from('app_settings')
    .update({ payment_model: paymentModel, updated_by: updatedBy })
    .eq('id', 1)
    .select('id, payment_model, updated_at, updated_by')
    .single()
  if (error || !data) throw new Error(error?.message || 'Unable to save settings.')
  return data as AppSettings
}
