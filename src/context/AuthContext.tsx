import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { authApi, userApi } from '../services/api'
import type {
  User,
  DecodedToken,
  AuthRequest,
  UserRole,
  UserStatusDTO,
} from '../types'

interface AuthContextType {
  user: User | null
  familyEntity: any | null
  status: UserStatusDTO | null
  myFamilyId: number | null
  loading: boolean
  token: string | null
  login: (credentials: AuthRequest) => Promise<User | null>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  refreshUser: () => Promise<void>
  refreshStatus: () => Promise<void>
  updateSession: (
    accessToken: string,
    refreshToken: string,
    familyData?: any,
  ) => User | null
  updateTokenAfterFamilyCreation: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [familyEntity, setFamilyEntity] = useState<any | null>(null)
  const [status, setStatus] = useState<UserStatusDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('accessToken'),
  )

  // Memoizamos el ID para evitar re-renders innecesarios en el Chat
  const myFamilyId = useMemo(() => {
    return status?.familyId || familyEntity?.id || null
  }, [status, familyEntity])

  const decodeToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      const currentTime = Date.now() / 1000
      if (decoded.exp && decoded.exp < currentTime) {
        logout() // Si expiró, fuera
        return null
      }
      return { email: decoded.sub, roles: decoded.roles }
    } catch {
      return null
    }
  }

  const refreshStatus = async () => {
    try {
      const currentStatus = await userApi.getStatus()
      setStatus(currentStatus)
    } catch (e) {
      console.error('Error sincronizando status:', e)
    }
  }

  const fetchFamilyFromApi = async () => {
    try {
      const profile = await authApi.getProfile()
      if (profile?.family) {
        localStorage.setItem('familyEntity', JSON.stringify(profile.family))
        setFamilyEntity(profile.family)
        return profile.family
      }
    } catch (e) {
      console.warn('Usuario logueado pero sin perfil de familia creado.')
    }
    return null
  }

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('accessToken')
      const savedFamily = localStorage.getItem('familyEntity')

      if (savedToken) {
        const decodedUser = decodeToken(savedToken)
        if (decodedUser) {
          setUser(decodedUser)
          setToken(savedToken)

          // Cargamos status y familia en paralelo para optimizar el arranque
          await Promise.all([
            refreshStatus(),
            (async () => {
              if (savedFamily && savedFamily !== 'undefined') {
                try {
                  setFamilyEntity(JSON.parse(savedFamily))
                } catch {
                  await fetchFamilyFromApi()
                }
              } else {
                await fetchFamilyFromApi()
              }
            })(),
          ])
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const updateSession = (
    accessToken: string,
    refreshToken: string,
    familyData?: any,
  ): User | null => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setToken(accessToken)

    const userData = decodeToken(accessToken)

    if (familyData) {
      localStorage.setItem('familyEntity', JSON.stringify(familyData))
      setFamilyEntity(familyData)
    }

    setUser(userData)
    refreshStatus() // Vital para que las rutas protegidas se actualicen
    return userData
  }

  const login = async (credentials: AuthRequest): Promise<User | null> => {
    setLoading(true)
    try {
      const response = await authApi.login(credentials)
      const loggedUser = updateSession(
        response.accessToken,
        response.refreshToken,
        response.family,
      )
      await refreshStatus()
      return loggedUser
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

  const hasRole = (role: UserRole) => user?.roles?.includes(role) || false

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('accessToken')
    if (currentToken) {
      setUser(decodeToken(currentToken))
      await refreshStatus()
    }
  }

  const updateTokenAfterFamilyCreation = async (): Promise<User | null> => {
    try {
      const response = await authApi.refreshSession()
      const freshFamily = await fetchFamilyFromApi()
      await refreshStatus()

      return updateSession(
        response.accessToken,
        response.refreshToken,
        freshFamily || familyEntity,
      )
    } catch (error) {
      console.error('Error actualizando sesión:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        familyEntity,
        status,
        myFamilyId,
        loading,
        token,
        login,
        logout,
        hasRole,
        refreshUser,
        refreshStatus,
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
