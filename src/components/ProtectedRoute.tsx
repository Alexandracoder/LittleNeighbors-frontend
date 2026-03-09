import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
          <p className="text-white mt-4">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userRoles = user.roles || []

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(role => userRoles.includes(role))

    if (!hasPermission) {
      // Redirección inteligente si es un usuario recién registrado (ROLE_USER)
if (
  userRoles.includes('USER') &&
  !userRoles.includes('FAMILY') &&
  location.pathname !== '/create-family' &&
  location.pathname !== '/add-child'
) {
  return <Navigate to="/create-family" replace />
}
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
