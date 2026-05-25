import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface OnboardingGuardProps {
  children: React.ReactNode
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const {
    user,
    status,
    familyEntity,
    updateSession,
    loading: authLoading,
  } = useAuth()
  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const verifyRealStatus = async () => {
      try {
        // ⚡ Solución limpia: Solo sincronizamos si no tenemos el status poblado en el contexto
        if (!status) {
          await updateSession()
        }
      } catch (err) {
        console.error(
          'Error en la sincronización de seguridad del onboarding:',
          err,
        )
      } finally {
        setChecking(false)
      }
    }

    if (user) {
      verifyRealStatus()
    } else {
      setChecking(false)
    }
    // Quitamos updateSession de las dependencias para evitar re-ejecuciones y bucles infinitos
  }, [user, status])

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4" />
        <p className="font-black text-xs text-orange-600 uppercase tracking-widest animate-pulse">
          Checking community credentials...
        </p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  const hasFamily =
    status?.hasFamily === true ||
    (familyEntity !== null && Object.keys(familyEntity).length > 0)
  const hasChildren = status?.hasChildren === true

  if (!hasFamily) {
    if (location.pathname !== '/create-family') {
      return <Navigate to="/create-family" replace />
    }
  } else if (!hasChildren) {
    if (location.pathname !== '/add-child') {
      return <Navigate to="/add-child" replace />
    }
  } else {
    if (
      location.pathname === '/create-family' ||
      location.pathname === '/add-child'
    ) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export default OnboardingGuard
