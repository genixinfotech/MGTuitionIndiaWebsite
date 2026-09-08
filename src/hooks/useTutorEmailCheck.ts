import { useEffect, useState } from 'react'
import { checkTutorEmail } from '@/lib/tutors'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type TutorEmailCheckStatus = 'idle' | 'checking' | 'available' | 'unavailable'

export function useTutorEmailCheck(email: string) {
  const [status, setStatus] = useState<TutorEmailCheckStatus>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const normalized = email.trim().toLowerCase()

    if (!normalized) {
      setStatus('idle')
      setMessage('')
      return
    }

    if (!EMAIL_PATTERN.test(normalized)) {
      setStatus('idle')
      setMessage('')
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        setStatus('checking')
        setMessage('')

        try {
          const result = await checkTutorEmail(normalized)
          if (cancelled) return

          if (result.available) {
            setStatus('available')
            setMessage('This email is available to register')
          } else {
            setStatus('unavailable')
            setMessage(result.message || 'This email is already registered on the platform')
          }
        } catch (err) {
          if (cancelled) return
          setStatus('unavailable')
          setMessage(err instanceof Error ? err.message : 'Unable to verify this email.')
        }
      })()
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [email])

  return {
    status,
    message,
    isChecking: status === 'checking',
    isAvailable: status === 'available',
    isUnavailable: status === 'unavailable',
    canSubmitWithEmail: status === 'available',
  }
}
