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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
        <p className="font-medium animate-pulse uppercase tracking-widest text-xs">
          Verificando vecindario...
        </p>
      </div>
    )
  }


  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const hasFamily = !!familyEntity
  const hasChildren = familyEntity?.children && familyEntity.children.length > 0
  const path = location.pathname


  if (!hasFamily) {
    if (path !== '/create-family') {
      return <Navigate to="/create-family" replace />
    }
    return <>{children}</>
  }

  if (!hasChildren) {

    if (path !== '/add-child' && path !== '/create-family') {
      return <Navigate to="/add-child" replace />
    }
    return <>{children}</>
  }


if (hasFamily && hasChildren) {
  return <>{children}</>
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

  return <>{children}</>
}