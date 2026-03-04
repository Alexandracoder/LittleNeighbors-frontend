import axios from 'axios'
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
  FamilyAuthResponseDTO,
} from '../types'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para inyectar el token en cada petición
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

// Interceptor para manejar el refresco automático de tokens (401 Unauthorized)
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Usamos axios directo aquí para evitar bucles infinitos con el interceptor
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
        localStorage.clear() // Limpiamos todo
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

  refreshSession: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken')
    // Enviamos el record tal cual lo espera el backend
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })
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
    return response.data // <-- Esto es vital
  },
}
export const interestApi = {
  getAll: async (): Promise<InterestResponseDTO[]> => {
    const response = await api.get<InterestResponseDTO[]>('/interests')
    return response.data
  },
}

export const childApi = {
  // --- CORRECCIÓN CLAVE: Ahora pide SOLO los niños de tu familia ---
  getAll: async (): Promise<ChildResponseDTO[]> => {
    const response = await api.get<ChildResponseDTO[]>('/children/my-children')
    return response.data
  },

  // Mantenemos este para el admin si fuera necesario
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
}

export default api
