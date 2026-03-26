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

  // 1. Si no hay familia, solo permitimos estar en /create-family
  if (!familyEntity) {
    if (location.pathname === '/create-family') return <>{children}</>
    return <Navigate to="/create-family" replace />
  }

  // 2. Si no hay hijos, solo permitimos /add-child o /create-family
  const hasChildren = familyEntity.children && familyEntity.children.length > 0
  if (!hasChildren) {
    if (
      location.pathname === '/add-child' ||
      location.pathname === '/create-family'
    ) {
      return <>{children}</>
    }
    return <Navigate to="/add-child" replace />
  }

  
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || []

    const hasPermission = allowedRoles.some(allowed =>
      userRoles.some(
        userRole =>
          userRole.replace('ROLE_', '') === allowed.replace('ROLE_', ''),
      ),
    )

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
