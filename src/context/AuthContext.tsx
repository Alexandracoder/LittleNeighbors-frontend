import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { authApi, userApi, familyApi } from '../services/api'
import type {
  User,
  DecodedToken,
  AuthRequest,
  UserRole,
  UserStatusDTO,
  FamilyResponseDTO,
  AuthResponse,
} from '../types'

interface AuthContextType {
  user: User | null
  familyEntity: FamilyResponseDTO | null
  status: UserStatusDTO | null
  loading: boolean
  token: string | null
  login: (credentials: AuthRequest) => Promise<User | null>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  refreshProfile: () => Promise<FamilyResponseDTO | null>
  refreshStatus: () => Promise<UserStatusDTO | null>
  updateSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [familyEntity, setFamilyEntity] = useState<FamilyResponseDTO | null>(
    null,
  )
  const [status, setStatus] = useState<UserStatusDTO | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('accessToken'),
  )
  const [loading, setLoading] = useState(true)

  const decodeToken = (t: string): User | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(t)
      const currentTime = Date.now() / 1000
      if (decoded.exp && decoded.exp < currentTime) return null
return {
  email: decoded.sub,
  roles: decoded.roles,
  id: '',
  family: null,
}
    } catch {
      return null
    }
  }

  const refreshStatus = async (): Promise<UserStatusDTO | null> => {
    try {
      const currentStatus = await userApi.getStatus()
      setStatus(currentStatus)
      return currentStatus
    } catch {
      return null
    }
  }

const fetchFamilyFromApi = async (): Promise<FamilyResponseDTO | null> => {
  try {
    const family = await familyApi.getMyFamily()
    setFamilyEntity(family)
    return family
  } catch {
    setFamilyEntity(null)
    return null
  }
}

  const updateSession = async () => {
    setLoading(true)
    try {
      await Promise.allSettled([refreshStatus(), fetchFamilyFromApi()])
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: AuthRequest): Promise<User | null> => {
    setLoading(true)
    try {
      const response: AuthResponse = await authApi.login(credentials)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setToken(response.accessToken)

      const decodedUser = decodeToken(response.accessToken)
      setUser(decodedUser)

      await Promise.allSettled([refreshStatus(), fetchFamilyFromApi()])
      return decodedUser
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    sessionStorage.clear()
    setUser(null)
    setFamilyEntity(null)
    setStatus(null)
    setToken(null)
    window.location.href = '/login'
  }

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('accessToken')
      if (savedToken) {
        const decodedUser = decodeToken(savedToken)
        if (decodedUser) {
          setUser(decodedUser)
          setToken(savedToken)
          await Promise.allSettled([refreshStatus(), fetchFamilyFromApi()])
        } else {
          logout()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const hasRole = (role: UserRole) => user?.roles.includes(role) || false

  return (
    <AuthContext.Provider
      value={{
        user,
        familyEntity,
        status,
        loading,
        token,
        login,
        logout,
        hasRole,
        refreshProfile: fetchFamilyFromApi,
        refreshStatus,
        updateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
