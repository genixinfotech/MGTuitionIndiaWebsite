import { Navigate } from 'react-router-dom'

/** @deprecated Use /portal/profile */
export function ProfilePage() {
  return <Navigate to="/portal/profile" replace />
}
