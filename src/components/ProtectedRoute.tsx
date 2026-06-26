import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center text-[#2D2D2D]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F28749] border-t-transparent mb-4" />
        <p className="font-black animate-pulse uppercase tracking-[0.3em] text-[#F28749] text-xs">
          {t('loading.verifyingNeighborhood') || 'LOADING...'}
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = (user.roles || []).map(r =>
      String(r).replace('ROLE_', '').toUpperCase(),
    )
    const hasPermission = allowedRoles.some(allowed =>
      userRoles.includes(allowed.replace('ROLE_', '').toUpperCase()),
    )

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
