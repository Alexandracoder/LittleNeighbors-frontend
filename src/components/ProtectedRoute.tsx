import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { t } = useTranslation()
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-orange/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 text-brand-orange animate-spin relative z-10" />
        </div>
        <p className="text-white mt-8 font-black uppercase tracking-[0.3em] text-xs animate-pulse">
          {t('common.loading')}
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userRoles = user.roles || []

  // LÓGICA DE FLUJO DE ONBOARDING:
  // Si el usuario es nuevo (USER) pero no tiene familia (FAMILY),
  // forzamos la creación de familia a menos que ya esté en las rutas de onboarding.
  const isNewUserWithoutFamily =
    userRoles.includes('USER') && !userRoles.includes('FAMILY')
  const isOnboardingRoute =
    location.pathname === '/create-family' || location.pathname === '/add-child'

  if (isNewUserWithoutFamily && !isOnboardingRoute) {
    return <Navigate to="/create-family" replace />
  }

  // VALIDACIÓN DE ROLES ESPECÍFICOS (Admin, etc.)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(role => userRoles.includes(role))

    if (!hasPermission) {
      // Si no tiene permiso pero es un usuario normal, al Dashboard.
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
