import api from './api'
import { Playdate, PlaydateRequest } from '../types'

const playdateService = {
  create: async (playdateData: PlaydateRequest): Promise<Playdate> => {
    const response = await api.post('/playdates', playdateData)
    return response.data
  },

  getByFamily: async (familyId: number): Promise<Playdate[]> => {
    const response = await api.get(`/playdates/family/${familyId}`)
    return response.data
  },

  getByMatch: async (matchId: number): Promise<Playdate[]> => {
    const response = await api.get(`/playdates/match/${matchId}`)
    return response.data
  },

  getAllMyPlaydates: async (): Promise<Playdate[]> => {
    const response = await api.get('/playdates/my-playdates')
    return response.data
  },


  confirm: async (playdateId: number): Promise<Playdate> => {
    const response = await api.patch(`/playdates/${playdateId}/confirm`)
    return response.data
  },
}

export default playdateService
