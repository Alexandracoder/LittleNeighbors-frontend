import { useEffect, useState } from 'react'
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
    hasRole,
  } = useAuth()


  if (user && hasRole('ADMIN')) {
    return <>{children}</>
  }


  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const verifyRealStatus = async () => {
      try {
        if (!status) {
          await updateSession()
        }
      } catch (err) {
        console.error(
          'Error sync security in Onboarding:',
          err,
        )
      } finally {
        setChecking(false)
      }
    }

    if (user && !hasRole('ADMIN')) {
      verifyRealStatus()
    } else {
      setChecking(false)
    }
  }, [user, status, hasRole])

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

  if (hasRole('ADMIN')) {
    return <>{children}</>
  }

  const hasFamily =
    status?.hasFamily === true ||
    (familyEntity !== null && Object.keys(familyEntity).length > 0)
  const hasChildren = status?.hasChildren === true

  // Tras completar familia + hijo, un único empujón para verificar la
  // identidad — no se repite si ya se descartó una vez (localStorage), para
  // no bloquear el uso normal de la app a quien no quiere verificarse
  // todavía (puede seguir viendo el mapa/su perfil sin problema).
  const verificationPromptDismissed =
    localStorage.getItem('ln_verify_prompt_dismissed') === 'true'
  const shouldPromptVerification =
    hasFamily &&
    hasChildren &&
    status?.verificationStatus === 'UNVERIFIED' &&
    !verificationPromptDismissed

  if (!hasFamily) {
    if (location.pathname !== '/create-family') {
      return <Navigate to="/create-family" replace />
    }
  } else if (!hasChildren) {
    if (location.pathname !== '/add-child') {
      return <Navigate to="/add-child" replace />
    }
  } else if (shouldPromptVerification) {
    if (location.pathname !== '/verify-id') {
      return <Navigate to="/verify-id" replace state={{ fromOnboarding: true }} />
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
