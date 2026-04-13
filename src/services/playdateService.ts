import axios from 'axios'
import { Playdate, PlaydateRequest } from '../types'

const API_URL = 'http://localhost:8080/api/playdates'

export const playdateService = {
  create: async (
    playdateData: PlaydateRequest,
    token: string,
  ): Promise<Playdate> => {
    const response = await axios.post(API_URL, playdateData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  getByFamily: async (familyId: number, token: string): Promise<Playdate[]> => {
    const response = await axios.get(`${API_URL}/family/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
}
