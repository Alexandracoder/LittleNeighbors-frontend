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
  handleFamilyCreation: (responseData: {
    family: FamilyResponseDTO
    accessToken: string
    refreshToken: string
  }) => void
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
        id: decoded.id ? decoded.id.toString() : '',
        email: decoded.sub,
        firstName: 'Neighbor', // Fallback seguro al recargar la página (F5)
        lastName: '',
        roles: decoded.roles,
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

      if (user && currentStatus.roles) {
        setUser({
          ...user,
          roles: Array.isArray(currentStatus.roles)
            ? currentStatus.roles
            : user.roles,
        })
      }

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
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('Notice: User has no linked family yet (Initial state).')
        setFamilyEntity(null)
        return null
      }

      console.error('Connection error retrieving family:', error)
      setFamilyEntity(null)
      return null
    }
  }

  const updateSession = async () => {
    setLoading(true)
    try {
      const currentStatus = await userApi.getStatus()
      setStatus(currentStatus)

      const family = await familyApi.getMyFamily().catch(() => null)
      setFamilyEntity(family)

      if (currentStatus && currentStatus.roles) {
        setUser(prev =>
          prev
            ? {
                ...prev,
                roles: Array.isArray(currentStatus.roles)
                  ? currentStatus.roles
                  : prev.roles,
              }
            : null,
        )
      }
    } catch (error) {
      console.error('Error synchronizing session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFamilyCreation = (responseData: {
    family: FamilyResponseDTO
    accessToken: string
    refreshToken: string
  }) => {
    localStorage.setItem('accessToken', responseData.accessToken)
    localStorage.setItem('refreshToken', responseData.refreshToken)
    setToken(responseData.accessToken)

    const decodedUser = decodeToken(responseData.accessToken)
    setUser(decodedUser)
    setFamilyEntity(responseData.family)

    refreshStatus()
  }

  const login = async (credentials: AuthRequest): Promise<User | null> => {
    setLoading(true)
    try {
      const response: AuthResponse = await authApi.login(credentials)

      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setToken(response.accessToken)

      const fullUser: User = {
        id: response.id.toString(),
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        roles: response.roles,
        family: null,
      }

      setUser(fullUser)

      await Promise.allSettled([refreshStatus(), fetchFamilyFromApi()])
      return fullUser
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    sessionStorage.clear()
    setUser(null)
    familyEntity && setFamilyEntity(null)
    status && setStatus(null)
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

  const hasRole = (role: UserRole) => {
    if (!user) return false
    const searchRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`
    return user.roles.some(r => r === searchRole)
  }

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
        handleFamilyCreation,
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
