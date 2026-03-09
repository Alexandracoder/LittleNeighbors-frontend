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

  const fetchFamilyFromApi = async () => {
    try {
      const profile = await authApi.getProfile()
      if (profile && profile.family) {
        localStorage.setItem('familyEntity', JSON.stringify(profile.family))
        setFamilyEntity(profile.family)
        return profile.family
      }
    } catch (e) {
      console.warn('No se pudo sincronizar la familia desde la API.')
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

        if (savedFamily && savedFamily !== 'undefined') {
          try {
            setFamilyEntity(JSON.parse(savedFamily))
          } catch (e) {
            localStorage.removeItem('familyEntity')
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

      setUser(prev => {
        const baseUser = userData || prev
        if (!baseUser) return null

        // Forzamos a que los roles sean tratados como UserRole[]
        const currentRoles = (baseUser.roles || []) as UserRole[]
        const newRoles: UserRole[] = currentRoles.includes('FAMILY' as UserRole)
          ? currentRoles
          : [...currentRoles, 'FAMILY' as UserRole]

        return {
          ...baseUser,
          roles: newRoles,
          familyEntity: familyData, // Usamos el nombre exacto de tu interfaz
        }
      })
    } else {
      const savedFamily = localStorage.getItem('familyEntity')
      if (savedFamily && savedFamily !== 'undefined') {
        try {
          const parsedFamily = JSON.parse(savedFamily)
          setFamilyEntity(parsedFamily)
          if (userData) setUser({ ...userData, familyEntity: parsedFamily })
        } catch (e) {
          if (userData) setUser(userData)
        }
      } else if (userData) {
        setUser(userData)
      }
    }

    return userData
  }

  const login = async (credentials: AuthRequest): Promise<User | null> => {
    setLoading(true)
    localStorage.removeItem('familyEntity')

    try {
      const response = await authApi.login(credentials)
      const user = updateSession(
        response.accessToken,
        response.refreshToken,
        response.family,
      )

      setLoading(false)
      return user
    } catch (error) {
      setLoading(false)
      throw error
    }
  } // <--- AQUÍ TERMINA LOGIN

  const logout = () => {
    // Limpiamos absolutamente todo
    localStorage.clear()
    sessionStorage.clear()

    // Reseteamos el estado
    setUser(null)
    setFamilyEntity(null)

    // Forzamos la navegación al login
    window.location.href = '/login'
  }

  const hasRole = (role: UserRole) => user?.roles.includes(role) || false

  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken')
    if (token) setUser(decodeToken(token))
  }

  const updateTokenAfterFamilyCreation = async (): Promise<User | null> => {
    try {
      const response = await authApi.refreshSession()
      const freshFamily = await fetchFamilyFromApi()

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
  
