import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { authApi, userApi } from '../services/api' // Asegúrate de tener userApi definido
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
  status: UserStatusDTO | null // <-- NUEVO: El semáforo
  loading: boolean
  login: (credentials: AuthRequest) => Promise<User | null>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  refreshUser: () => Promise<void>
  refreshStatus: () => Promise<void> // <-- NUEVO: Para actualizar hijos/familia
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
  const [status, setStatus] = useState<UserStatusDTO | null>(null) // <-- NUEVO
  const [loading, setLoading] = useState(true)

  const decodeToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      return { email: decoded.sub, roles: decoded.roles }
    } catch {
      return null
    }
  }

  // --- NUEVA FUNCIÓN: Obtiene el status (Record) del backend ---
  const refreshStatus = async () => {
    try {
      const currentStatus = await userApi.getStatus() // Llama a /api/users/me/status
      setStatus(currentStatus)
    } catch (e) {
      console.error('Error sincronizando status:', e)
    }
  }

  const fetchFamilyFromApi = async () => {
    try {
      const profile = await authApi.getProfile()
      if (profile && profile.family) {
        localStorage.setItem('familyEntity', JSON.stringify(profile.family))
        setFamilyEntity(profile.family)
        return profile.family
      }
    } catch (e) {
      console.warn('No se pudo sincronizar la familia.')
    }
    return null
  }

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      const savedFamily = localStorage.getItem('familyEntity')

      if (token) {
        const decodedUser = decodeToken(token)
        setUser(decodedUser)

        // 1. Cargamos el Status (Esto activará el isRegistrationComplete)
        await refreshStatus()

        // 2. Cargamos la familia
        if (savedFamily && savedFamily !== 'undefined') {
          try {
            setFamilyEntity(JSON.parse(savedFamily))
          } catch (e) {
            await fetchFamilyFromApi()
          }
        } else {
          await fetchFamilyFromApi()
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
    const userData = decodeToken(accessToken)

    if (familyData) {
      localStorage.setItem('familyEntity', JSON.stringify(familyData))
      setFamilyEntity(familyData)
      // Al actualizar sesión, refrescamos el status para asegurar que isRegistrationComplete sea correcto
      refreshStatus()

      setUser(prev => {
        const baseUser = userData || prev
        if (!baseUser) return null
        const currentRoles = (baseUser.roles || []) as UserRole[]
        const newRoles: UserRole[] = currentRoles.includes('FAMILY' as UserRole)
          ? currentRoles
          : [...currentRoles, 'FAMILY' as UserRole]
        return { ...baseUser, roles: newRoles, familyEntity: familyData }
      })
    } else if (userData) {
      setUser(userData)
      refreshStatus()
    }
    return userData
  }

  const login = async (credentials: AuthRequest): Promise<User | null> => {
    setLoading(true)
    localStorage.removeItem('familyEntity')
    try {
      const response = await authApi.login(credentials)
      const loggedUser = updateSession(
        response.accessToken,
        response.refreshToken,
        response.family,
      )
      // IMPORTANTE: Esperamos a tener el status antes de quitar el loading
      await refreshStatus()
      setLoading(false)
      return loggedUser
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = () => {
    localStorage.clear()
    sessionStorage.clear()
    setUser(null)
    setFamilyEntity(null)
    setStatus(null) // Limpiamos status
    window.location.href = '/login'
  }

  const hasRole = (role: UserRole) => user?.roles.includes(role) || false

  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      setUser(decodeToken(token))
      await refreshStatus()
    }
  }

  const updateTokenAfterFamilyCreation = async (): Promise<User | null> => {
    try {
      const response = await authApi.refreshSession()
      const freshFamily = await fetchFamilyFromApi()

      // Al crear la familia, también refrescamos el status
      // (aunque hasChildren seguirá siendo false hasta que añada el primer hijo)
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
        status, // <-- EXPONEMOS EL STATUS
        loading,
        login,
        logout,
        hasRole,
        refreshUser,
        refreshStatus, // <-- EXPONEMOS EL MÉTODO
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
