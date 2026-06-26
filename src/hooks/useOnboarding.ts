import { useState, useEffect } from 'react'

export interface UserStatus {
  hasFamily: boolean
  hasChildren: boolean
  isRegistrationComplete: boolean
}

export const useOnboarding = () => {
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserStatus = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/user/status')
      if (!response.ok) throw new Error('Failed to fetch user status')

      const data: UserStatus = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserStatus()
  }, [])

  return {
    status,
    loading,
    error,
    refreshStatus: fetchUserStatus,
    needsFamily: status ? !status.hasFamily : false,
    needsChildren: status ? !status.hasChildren : false,
  }
}
