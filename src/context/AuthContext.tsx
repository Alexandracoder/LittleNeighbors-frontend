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

  const isAdmin = (roles: UserRole[] = []) => {
    return (
      roles.includes('ADMIN' as UserRole) ||
      roles.includes('ROLE_ADMIN' as UserRole)
    )
  }

  const decodeToken = (t: string): User | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(t)
      const currentTime = Date.now() / 1000
      if (decoded.exp && decoded.exp < currentTime) return null

      const extractedRoles: UserRole[] = Array.isArray(decoded.roles)
        ? (decoded.roles as UserRole[])
        : []

      return {
        id: decoded.id ? decoded.id.toString() : '',
        email: decoded.sub || '',
        firstName: '',
        lastName: '',
        roles: extractedRoles,
        family: null,
        children: false,
        hasFamily: false,
        hasChildren: false,
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
        setUser(prev =>
          prev
            ? {
                ...prev,
                roles: Array.isArray(currentStatus.roles)
                  ? (currentStatus.roles as unknown as UserRole[])
                  : prev.roles,
              }
            : null,
        )
      }
      return currentStatus
    } catch {
      return null
    }
  }

  const refreshProfile = async (): Promise<FamilyResponseDTO | null> => {
    if (user && isAdmin(user.roles)) {
      setFamilyEntity(null)
      return null
    }
    try {
      const family = await familyApi.getMyFamily()
      setFamilyEntity(family)
      return family
    } catch (error: any) {
      setFamilyEntity(null)
      return null
    }
  }

  const updateSession = async () => {
    try {
      const currentStatus = await userApi.getStatus()
      setStatus(currentStatus)

      const roles = Array.isArray(currentStatus.roles)
        ? (currentStatus.roles as unknown as UserRole[])
        : []

      if (!isAdmin(roles)) {
        const family = await familyApi.getMyFamily().catch(() => null)
        setFamilyEntity(family)
      } else {
        setFamilyEntity(null)
      }

      setUser(prev => (prev ? { ...prev, roles } : null))
    } catch (error) {
      console.error('Error updating session:', error)
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

    let extractedRoles: UserRole[] = ['ROLE_FAMILY']
    let email = ''
    let id = ''

    try {
      const decoded = jwtDecode<DecodedToken>(responseData.accessToken)
      if (decoded.roles && Array.isArray(decoded.roles)) {
        extractedRoles = decoded.roles as UserRole[]
      }
      if (decoded.sub) email = decoded.sub
      if (decoded.id) id = decoded.id.toString()
    } catch (e) {
      console.error(e)
    }

    const updatedUser: User = {
      id: id,
      email: email,
      firstName: user?.firstName || 'Neighbor',
      lastName: user?.lastName || '',
      roles: extractedRoles,
      family: null,
      children: false,
      hasFamily: true,
      hasChildren: false,
    }

    setUser(updatedUser)
    setFamilyEntity(responseData.family)

    setStatus({
      hasFamily: true,
      hasChildren: false,
      isRegistrationComplete: false,
      roles: extractedRoles as unknown as User,
    })
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
        hasChildren: false,
        hasFamily: false,
        children: false,
      }

      setUser(fullUser)
      await refreshStatus()
      if (!isAdmin(fullUser.roles)) {
        await refreshProfile()
      }
      return fullUser
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
          await refreshStatus()
          if (!isAdmin(decodedUser.roles)) {
            await refreshProfile()
          }
        } else {
          logout()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const hasRole = (role: UserRole) => {
    if (!user || !user.roles) return false
    const searchRole = role.toUpperCase()
    return user.roles.some(r => {
      const roleString = (r as string).toUpperCase()
      return roleString === searchRole || roleString === `ROLE_${searchRole}`
    })
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
        refreshProfile,
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
