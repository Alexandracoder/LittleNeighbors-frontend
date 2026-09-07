import api from './api'
import axios from 'axios'

export type MatchStatus = 'ACCEPTED' | 'REJECTED'

export interface MatchResponseDTO {
  sharedInterests: any
  childRequest: any
  childTarget: any
  neighborName: any
  matchId: number
  initiatorFamilyId: number
  targetFamilyId: number
  theirFamilyName: string
  theirNeighborhoodName: string
  status: MatchStatus
  hasUnread?: boolean
}

const matchService = {
  getMyMatches: async (): Promise<MatchResponseDTO[]> => {
    try {
      const response = await api.get<MatchResponseDTO[]>('matches/my-matches')
      return response.data
    } catch (error: unknown) {
      handleError('Error fetching matches:', error)
    }
  },

  requestMatch: async (
    initiatorChildId: number,
    targetChildId: number,
  ): Promise<any> => {
    try {
      const response = await api.post('/matches/request', {
        initiatorChildId,
        targetChildId,
      })
      return response.data
    } catch (error: unknown) {
      handleError('Error requesting match:', error)
    }
  },

  respondToMatch: async (
    matchId: number,
    status: MatchStatus,
  ): Promise<any> => {
    try {
      const response = await api.patch(`/matches/${matchId}/respond`, null, {
        params: { status },
      })
      return response.data
    } catch (error: unknown) {
      handleError('Error responding to match:', error)
    }
  },

  confirmMatch: async (matchId: number, email: string): Promise<any> => {
    try {
      const response = await api.post(`/matches/${matchId}/confirm`, null, {
        params: { email },
      })
      return response.data
    } catch (error: unknown) {
      handleError('Error confirming match:', error)
    }
  },
}

function handleError(context: string, error: unknown): never {
  // Antes esto re-lanzaba `new Error(mensaje)` — un Error normal ya no
  // lleva `.response`, así que cualquier componente que mirara
  // `error.response?.data?.message` (el patrón habitual en el resto de
  // la app) se quedaba sin el motivo real y mostraba un error genérico.
  // Ahora se deja pasar el error de axios tal cual, intacto, para que
  // cada sitio que lo consuma pueda seguir leyendo error.response
  // normalmente.
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message || error.response?.data
    console.error(`${context} ${serverMessage || error.message}`)
    throw error
  }

  if (error instanceof Error) {
    console.error(`${context} ${error.message}`)
    throw error
  }

  console.error(context, error)
  throw new Error('An unexpected error occurred')
}

export default matchService
