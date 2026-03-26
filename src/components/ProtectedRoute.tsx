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
        <p className="font-medium animate-pulse uppercase tracking-widest text-xs tracking-tighter">
          Verificando vecindario...
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!familyEntity) {
    if (location.pathname === '/create-family') return <>{children}</>
    return <Navigate to="/create-family" replace />
  }

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

  // --- FLUJO DE USUARIO ACTIVO ---

 
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || []
    const hasPermission = allowedRoles.some(role => userRoles.includes(role))

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
