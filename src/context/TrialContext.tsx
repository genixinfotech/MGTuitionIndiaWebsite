import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type OpenTrialOptions = {
  referral?: string
  plan?: string
}

type TrialContextValue = {
  isOpen: boolean
  openTrial: (options?: OpenTrialOptions) => void
  closeTrial: () => void
  referral: string
  plan: string
}

const TrialContext = createContext<TrialContextValue | null>(null)

export function TrialProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [referral, setReferral] = useState('')
  const [plan, setPlan] = useState('')

  const openTrial = useCallback((options?: OpenTrialOptions) => {
    setReferral(options?.referral ?? '')
    setPlan(options?.plan ?? '')
    setIsOpen(true)
  }, [])

  const closeTrial = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, referral, plan, openTrial, closeTrial }),
    [isOpen, referral, plan, openTrial, closeTrial],
  )

  return <TrialContext.Provider value={value}>{children}</TrialContext.Provider>
}

export function useTrial() {
  const ctx = useContext(TrialContext)
  if (!ctx) throw new Error('useTrial must be used within TrialProvider')
  return ctx
}
