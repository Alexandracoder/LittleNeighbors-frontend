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
  const { user, familyEntity, loading } = useAuth()
  const location = useLocation()
  const path = location.pathname

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F28749] border-t-transparent mb-4"></div>
        <p className="font-black animate-pulse uppercase tracking-widest text-xs text-gray-800">
          Verificando vecindario...
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


  const hasFamily = !!familyEntity
  const hasChildren = familyEntity?.children && familyEntity.children.length > 0

  if (!hasFamily) {
    if (path !== '/create-family')
      return <Navigate to="/create-family" replace />
    return <>{children}</>
  }

  if (!hasChildren) {
    if (path !== '/add-child' && path !== '/create-family') {
      return <Navigate to="/add-child" replace />
    }
    return <>{children}</>
  }


  return <>{children}</>
}
