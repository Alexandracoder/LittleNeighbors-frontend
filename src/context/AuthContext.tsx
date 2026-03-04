import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { authApi } from '../services/api'
import type { User, DecodedToken, AuthRequest, UserRole } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: AuthRequest) => Promise<User | null>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  refreshUser: () => Promise<void>
  updateSession: (accessToken: string, refreshToken: string) => User | null
  updateTokenAfterFamilyCreation: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const decodeToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      return {
        email: decoded.sub,
        roles: decoded.roles,
      }
    } catch {
      return null
    }
  }

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const userData = decodeToken(token)
        setUser(userData)
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const userData = decodeToken(token)
      setUser(userData)
    }
  }

  const updateSession = (
    accessToken: string,
    refreshToken: string,
  ): User | null => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    const userData = decodeToken(accessToken)
    setUser(userData)
    return userData
  }

  const login = async (credentials: AuthRequest): Promise<User | null> => {
    const response = await authApi.login(credentials)
    return updateSession(response.accessToken, response.refreshToken)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const hasRole = (role: UserRole) => {
    return user?.roles.includes(role) || false
  }

  const updateTokenAfterFamilyCreation = async (): Promise<User | null> => {
    try {
      const response = await authApi.refreshSession()
      return updateSession(response.accessToken, response.refreshToken)
    } catch (error) {
      console.error('Error actualizando sesión:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasRole,
        refreshUser,
        updateSession,
        updateTokenAfterFamilyCreation,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined)
    throw new Error('useAuth must be used within an AuthProvider')
  return context
}
