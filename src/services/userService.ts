import api from './api'
import { UserProfileDTO } from '../types'

export const userService = {
  getProfile: async (): Promise<UserProfileDTO> => {
    const response = await api.get<UserProfileDTO>('/users/me')
    return response.data
  },
}
