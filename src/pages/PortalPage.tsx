import { Navigate } from 'react-router-dom'

/** @deprecated Use /portal routes inside PortalLayout */
export function PortalPage() {
  return <Navigate to="/portal" replace />
}
