import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'
import { t } from 'i18next'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, familyEntity, status, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4" />
        <p className="font-medium animate-pulse uppercase tracking-widest text-xs">
          {t('loading.verifyingNeighborhood')}
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || []
    const hasPermission = allowedRoles.some(allowed =>
      userRoles.some(
        ur => ur.replace('ROLE_', '') === allowed.replace('ROLE_', ''),
      ),
    )
    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />
    }
  }

  const path = location.pathname
  const hasFamily = status?.hasFamily ?? !!familyEntity
  const hasChildren = status?.hasChildren ?? !!familyEntity?.children?.length

  console.log(
    'ProtectedRoute execution — Path:',
    path,
    '| Has Family:',
    hasFamily,
    '| Has Children:',
    hasChildren,
  )


  if (!hasFamily) {
    if (path !== '/create-family') {
      return <Navigate to="/create-family" replace />
    }
    return <>{children}</>
  }

  if (!hasChildren) {
    if (path !== '/add-child') {
      return <Navigate to="/add-child" replace />
    }
    return <>{children}</>
  }

  return <>{children}</>
}
