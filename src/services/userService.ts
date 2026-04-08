import axios from 'axios'
import { UserProfileDTO } from '../types'

const API_URL = 'http://localhost:8080/api/users'

export const userService = {
  getProfile: async (token: string): Promise<UserProfileDTO> => {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
}
