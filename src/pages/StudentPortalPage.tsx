import { Navigate } from 'react-router-dom'

/** @deprecated Students use /portal */
export function StudentPortalPage() {
  return <Navigate to="/portal" replace />
}
