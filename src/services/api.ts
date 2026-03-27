import axios from 'axios'
import QueryString from 'qs'
import type {
  AuthRequest,
  AuthResponse,
  FamilyRequestDTO,
  ChildRequestDTO,
  ChildResponseDTO,
  NeighborhoodResponseDTO,
  RegisterRequest,
  Page,
  InterestResponseDTO,
  FamilyResponseDTO,
  UserProfileDTO,
  UserStatusDTO,
  SendMessageDTO,
  MessageResponseDTO,
} from '../types'
import qs from 'qs'

const API_BASE_URL = 'http://localhost:8080/api'
paramsSerializer: (params: any) => {
    // Esto quita los corchetes [] de la URL
    return qs.stringify(params, { arrayFormat: 'repeat' });
  }

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- INTERCEPTORES (Seguridad) ---
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

// --- AUTH API ---
export const authApi = {
  login: async (data: AuthRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },
  register: async (userData: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', userData)
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken })
    return response.data
  },
}


// --- NUEVO: PROFILE API ---
export const profileApi = {
  getProfile: async (): Promise<UserProfileDTO> => {
   
    const response = await api.get<UserProfileDTO>('/profile/me')
    return response.data
  },
}

// --- USER & FAMILY API ---
export const userApi = {
  getStatus: async (): Promise<UserStatusDTO> => {
    const response = await api.get<UserStatusDTO>('/users/me/status')
    return response.data
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
  explore: async (params?: {
    currentChildId: number
    interestIds?: number[]
    minAge?: number
    maxAge?: number
  }): Promise<FamilyResponseDTO[]> => {
    const response = await api.get<FamilyResponseDTO[]>(
      '/matches/explorer',
      { params },
    )
    return response.data
  },
}

// --- CHILD & INTERESTS API ---
export const childApi = {
  // CORRECCIÓN: Ruta sincronizada con el Backend
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

  requestMatch: async (initiatorChildId: number, targetChildId: number) => {
    const response = await api.post('/matches/request', {
      initiatorChildId,
      targetChildId,
    })
    return response.data
  },
}

export const interestApi = {
  getAll: async (): Promise<InterestResponseDTO[]> => {
    const response = await api.get<InterestResponseDTO[]>('/interests')
    return response.data
  },
}

// --- MATCH & MESSAGES API (Nuevos) ---
export const messageApi = {
  sendMessage: async (data: SendMessageDTO): Promise<MessageResponseDTO> => {
    const response = await api.post<MessageResponseDTO>('/messages/send', data)
    return response.data
  },
  getHistory: async (matchId: number): Promise<MessageResponseDTO[]> => {
    const response = await api.get<MessageResponseDTO[]>(
      `/messages/history/${matchId}`,
    )
    return response.data
  },
}

export const neighborhoodApi = {
  getAll: async (): Promise<NeighborhoodResponseDTO[]> => {
    // El backend devuelve una Page, por eso extraemos .content
    const response = await api.get<Page<NeighborhoodResponseDTO>>(
      '/neighborhoods',
    )
    return response.data.content
  },
}

export const matchApi = {
  requestMatch: async (childAId: number, childBId: number) => {
    const response = await api.post('/matches/request', null, {
      params: { childAId, childBId },
    })
    return response.data
  },
}

export default api
