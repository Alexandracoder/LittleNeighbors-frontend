import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
const [status, setStatus] = useState<UserStatusDTO | null>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
    const checkStatus = async () => {
    if (user && token) {
        try {
        const response = await fetch('/api/users/me/status', {
            headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
        })
        const data = await response.json()
        setStatus(data)
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

    return <div className="p-10 text-center">Cargando perfil...</div>
}


if (!user) return <Navigate to="/login" replace />


if (status) {
    if (!status.hasFamily) {
    return <Navigate to="/create-family" replace />
    }
    if (!status.hasChildren) {
    return <Navigate to="/add-child" replace />
    }
}


return <>{children}</>
}

export default OnboardingGuard
