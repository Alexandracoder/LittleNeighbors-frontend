import axios from 'axios'
import type {
  AuthRequest,
  AuthResponse,
  FamilyRequestDTO,
  FamilyResponseDTO,
  ChildRequestDTO,
  ChildResponseDTO,
  NeighborhoodResponseDTO,
  RegisterRequest,
  Page,
  ChildSummaryDTO,
  InterestResponseDTO,
} from '../types'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para añadir el Token JWT a cada petición
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar el Refresh Token (401 Unauthorized)
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
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// --- AUTH API ---
export const authApi = {
  login: async (data: AuthRequest): Promise<AuthResponse> => {
    console.log('Objeto data que recibe authApi:', data)
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  register: async (userData: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', userData)
  },
}

// --- NEIGHBORHOOD API ---
export const neighborhoodApi = {
  getAll: async (): Promise<NeighborhoodResponseDTO[]> => {
    const response = await api.get<Page<NeighborhoodResponseDTO>>(
      '/neighborhoods',
    )
    return response.data.content
  },
}

// --- FAMILY API ---
export const familyApi = {
  create: async (data: FamilyRequestDTO): Promise<FamilyResponseDTO> => {
    const response = await api.post<FamilyResponseDTO>('/families', data)
    return response.data
  },
}

// --- INTEREST API (Corregido: fuera de familyApi) ---
export const interestApi = {
  getAll: async (): Promise<InterestResponseDTO[]> => {
    const response = await api.get<InterestResponseDTO[]>('/interests')
    return response.data
  },
}

// --- CHILD API ---
export const childApi = {
  getAll: async (): Promise<ChildSummaryDTO[]> => {
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
