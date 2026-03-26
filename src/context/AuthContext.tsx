import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { authApi, userApi, profileApi } from '../services/api'
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
      return { email: decoded.sub, roles: decoded.roles }
    } catch {
      return null
    }
  }

  const refreshStatus = async (): Promise<UserStatusDTO | null> => {
    try {
      const currentStatus = await userApi.getStatus()
      setStatus(currentStatus)
      return currentStatus
    } catch (e) {
      console.warn('[Auth] Status sync failed')
      return null
    }
  }

  const fetchFamilyFromApi = async (): Promise<FamilyResponseDTO | null> => {
    try {
      const profile = await profileApi.getProfile()
      if (profile?.family) {
        setFamilyEntity(profile.family)
        return profile.family
      }
    } catch (e) {
      console.error('[Auth] Profile fetch failed.')
      setFamilyEntity(null)
    }
    return null
  }

  // Sincroniza la sesión tras cambios importantes (como crear una familia)
  const updateSession = async () => {
    setLoading(true)
    try {
      // Calidad: Refrescamos datos de perfil y estado sin forzar nuevo login
      await Promise.allSettled([refreshStatus(), fetchFamilyFromApi()])
    } catch (e) {
      console.error('[Auth] Session update failed', e)
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
    } catch (error) {
      throw error
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

  useEffect(() => {
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
