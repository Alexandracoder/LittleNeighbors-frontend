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
  familyEntity: any | null
  loading: boolean
  login: (credentials: AuthRequest) => Promise<User | null>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  refreshUser: () => Promise<void>
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
  const [loading, setLoading] = useState(true)

  const decodeToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      return { email: decoded.sub, roles: decoded.roles }
    } catch {
      return null
    }
  }

  // Inicialización: Recuperamos usuario y familia del LocalStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('accessToken')
      const savedFamily = localStorage.getItem('familyEntity')

      if (token) {
        setUser(decodeToken(token))
      }
      if (savedFamily) {
        setFamilyEntity(JSON.parse(savedFamily))
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

    if (familyData) {
      localStorage.setItem('familyEntity', JSON.stringify(familyData))
      setFamilyEntity(familyData)
    }

    const userData = decodeToken(accessToken)
    setUser(userData)
    return userData
  }

const login = async (credentials: AuthRequest): Promise<User | null> => {
  const response = await authApi.login(credentials)

  // DEBUG: Si response.family es undefined, aquí veremos la estructura real
  console.log('Respuesta cruda del backend:', response)

  // Si tu backend devuelve la familia dentro de un objeto diferente,
  // ajústalo aquí. Por ejemplo, si es response.data.family:
  const familyData = response.family || (response as any).data?.family

  return updateSession(response.accessToken, response.refreshToken, familyData)
}

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('familyEntity')
    setUser(null)
    setFamilyEntity(null)
  }

  const hasRole = (role: UserRole) => user?.roles.includes(role) || false

  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken')
    if (token) setUser(decodeToken(token))
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
        familyEntity,
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
