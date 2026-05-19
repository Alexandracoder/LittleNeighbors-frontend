import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

interface UserStatusDTO {
  hasFamily: boolean
  hasChildren: boolean
  isRegistrationComplete: boolean
}

interface OnboardingGuardProps {
  children: React.ReactNode
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, token } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()
  const [status, setStatus] = useState<UserStatusDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      if (user && token) {
        try {
          const baseUrl = import.meta.env.VITE_API_URL || ''
          const response = await fetch(`${baseUrl}/api/users/me/status`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          if (response.ok) {
            const data = await response.json()
            setStatus(data)
          }
        } catch (error) {
          console.error('Error verificando estado de onboarding:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    checkStatus()
  }, [user, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center text-[#2D2D2D]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4" />
        <p className="font-black animate-pulse uppercase tracking-[0.3em] text-orange-600 text-xs">
          {t('loading.verifyingNeighborhood') || 'LOADING PROFILE...'}
        </p>
      </div>
    )
  }


  if (!user) return <Navigate to="/login" replace />


  if (status) {
    if (!status.hasFamily) {
      if (location.pathname !== '/create-family') {
        return <Navigate to="/create-family" replace />
      }
    } else if (!status.hasChildren) {
      if (location.pathname !== '/add-child') {
        return <Navigate to="/add-child" replace />
      }
    }
  }

  return <>{children}</>
}

export default OnboardingGuard
