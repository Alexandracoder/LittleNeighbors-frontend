import axios from 'axios'
import { MatchRequest } from '../types'
import type {
  AuthRequest,
  AuthResponse,
  FamilyRequestDTO,
  ChildRequestDTO,
  ChildResponseDTO,
  NeighborhoodResponseDTO,
  RegisterRequest,
  Page,
  ChildSummaryDTO,
  InterestResponseDTO,
  FamilyResponseDTO,
  FamilyAuthResponseDTO,
  UserProfileDTO,
} from '../types'

const API_BASE_URL = 'http://localhost:8080/api'

// 1. Instancia base de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 2. Interceptor para inyectar el token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error),
)

// 3. Interceptor para refresco automático
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post<AuthResponse>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
          )
          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

// --- EXPORTACIONES ---

export const authApi = {
  login: async (data: AuthRequest): Promise<FamilyAuthResponseDTO> => {
    const response = await api.post<FamilyAuthResponseDTO>('/auth/login', data)
    return response.data
  },
  register: async (userData: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', userData)
  },
  refreshSession: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken')
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },
  getProfile: async (): Promise<UserProfileDTO> => {
    const response = await api.get<UserProfileDTO>('/auth/profile')
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
  create: async (data: FamilyRequestDTO): Promise<FamilyAuthResponseDTO> => {
    const response = await api.post<FamilyAuthResponseDTO>('/families', data)
    return response.data
  },
  explore: async (params?: {
    interestId?: number
    minAge?: number
    maxAge?: number
  }): Promise<FamilyResponseDTO[]> => {
    const response = await api.get<FamilyResponseDTO[]>('/families/explore', {
      params,
    })
    return response.data
  },
  getMyFamily: async (): Promise<FamilyResponseDTO> => {
    const response = await api.get<FamilyResponseDTO>('/families/my-family')
    return response.data
  },
}

export const interestApi = {
  getAll: async (): Promise<InterestResponseDTO[]> => {
    const response = await api.get<InterestResponseDTO[]>('/interests')
    return response.data
  },
}

export const childApi = {
  getAll: async (): Promise<ChildResponseDTO[]> => {
    const response = await api.get<ChildResponseDTO[]>('/children/my-children')
    return response.data
  },
  getAdminSummaries: async (): Promise<ChildSummaryDTO[]> => {
    const response = await api.get<ChildSummaryDTO[]>('/children/summaries')
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
  getById: async (id: number): Promise<ChildResponseDTO> => {
    const response = await api.get<ChildResponseDTO>(`/children/${id}`)
    return response.data
  },
  requestMatch: async (initiatorId: number, targetId: number) => {
    try {
      const response = await api.post('/matches/request', {
        initiatorChildId: initiatorId,
        targetChildId: targetId,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data || 'Error al solicitar el match')
    }
  },
}

export default api
