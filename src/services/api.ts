import axios from 'axios'
import type {
  AuthRequest,
  AuthResponse,
  RefreshRequest,
  FamilyRequestDTO,
  FamilyResponseDTO,
  ChildRequestDTO,
  ChildResponseDTO,
  NeighborhoodResponseDTO,
  RegisterRequest,
  InterestResponseDTO,
  UserStatusDTO,
  UserProfileDTO,
  Page,
} from '../types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
export const WS_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Antes no había timeout: si el backend se quedaba colgado (como pasó
  // con el envío síncrono de emails), la petición se quedaba "pending"
  // en el navegador sin límite. 15s da margen de sobra para peticiones
  // normales sin dejar a la persona esperando indefinidamente.
  timeout: 15000,
})

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error),
)

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error()

        const response = await refreshApi.post<AuthResponse>('/auth/refresh', {
          refreshToken,
        })
        const { accessToken, refreshToken: newRefreshToken } = response.data

        localStorage.setItem('accessToken', accessToken)
        if (newRefreshToken)
          localStorage.setItem('refreshToken', newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  login: async (data: AuthRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },
  register: async (userData: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', userData)
  },
  refresh: async (data: RefreshRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', data)
    return response.data
  },
}

export const neighborhoodApi = {
  getAll: async (): Promise<NeighborhoodResponseDTO[]> => {
    const response = await api.get<Page<NeighborhoodResponseDTO>>(
      '/neighborhoods',
    )
    return response.data.content
  },
}

export const familyApi = {
  create: async (data: FamilyRequestDTO): Promise<FamilyResponseDTO> => {
    const response = await api.post<FamilyResponseDTO>('/families', data)
    return response.data
  },
  getMyFamily: async (): Promise<FamilyResponseDTO> => {
    const response = await api.get<FamilyResponseDTO>('/families/my-family')
    return response.data
  },
  update: async (
    id: number,
    data: FamilyRequestDTO,
  ): Promise<FamilyResponseDTO> => {
    const response = await api.put<FamilyResponseDTO>(`/families/${id}`, data)
    return response.data
  },
  explore: async (filters: {
    currentChildId: number
    minAge: number
    maxAge: number
    interestIds?: number[]
    includePregnant?: boolean
    scope?: 'neighborhood' | 'city'
  }): Promise<FamilyResponseDTO[]> => {
    const response = await api.get<FamilyResponseDTO[]>('/families/explore', {
      params: {
        currentChildId: filters.currentChildId,
        minAge: filters.minAge,
        maxAge: filters.maxAge,
        ...(filters.interestIds && filters.interestIds.length > 0
          ? { interestIds: filters.interestIds }
          : {}),
        ...(filters.includePregnant ? { includePregnant: true } : {}),
        ...(filters.scope === 'city' ? { citywide: true } : {}),
      },
    })
    return response.data
  },
}

export const childApi = {
  getAll: async (): Promise<ChildResponseDTO[]> => {
    const response = await api.get<ChildResponseDTO[]>('/children/my-children')
    return response.data
  },
  create: async (data: ChildRequestDTO): Promise<ChildResponseDTO> => {
    const response = await api.post<ChildResponseDTO>('/children', data)
    return response.data
  },
  update: async (
    id: number,
    data: ChildRequestDTO,
  ): Promise<ChildResponseDTO> => {
    const response = await api.put<ChildResponseDTO>(`/children/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/children/${id}`)
  },
  requestMatch: async (
    myChildId: number,
    targetChildId: number,
  ): Promise<void> => {
    await api.post('/matches/request', {
      initiatorChildId: myChildId,
      targetChildId,
    })
  },
}

export const interestApi = {
  getAll: async (): Promise<InterestResponseDTO[]> => {
    const response = await api.get<InterestResponseDTO[]>('/interests')
    return response.data
  },
}

export const userApi = {
  getStatus: async (): Promise<UserStatusDTO> => {
    const response = await api.get<UserStatusDTO>('/users/me/status')
    return response.data
  },
}

export const profileApi = {
  getProfile: async (): Promise<{ family: FamilyResponseDTO | null }> => {
    const response = await api.get<UserProfileDTO>('/auth/profile')
    return { family: response.data.family ?? null }
  },
}

export const notificationApi = {
  getMyNotifications: async () => {
    const response = await api.get('/notifications/me')
    return response.data
  },
  markAsRead: async (id: number) => {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count')
    return response.data
  },
}

export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },
  getDetailedStats: async () => {
    const response = await api.get('/admin/stats/detailed')
    return response.data
  },
}

export default api
