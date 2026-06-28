import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

/**
 * Gate dashboard routes: only authenticated vendors (or admins) may enter.
 * Shows a lightweight loading state until the session is restored.
 */
export default function RequireVendor({ children }) {
  const user = useAuth((s) => s.user)
  const initialized = useAuth((s) => s.initialized)

  if (!initialized) {
    return <div className="container-page py-20 text-center text-slate-500">Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login?redirect=/dashboard" replace />
  }

  if (user.role !== 'vendor' && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
