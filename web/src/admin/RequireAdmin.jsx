import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

/** Gate admin routes to authenticated users with the admin role. */
export default function RequireAdmin({ children }) {
  const user = useAuth((s) => s.user)
  const initialized = useAuth((s) => s.initialized)

  if (!initialized) {
    return <div className="container-page py-20 text-center text-slate-500">Loading…</div>
  }
  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}
