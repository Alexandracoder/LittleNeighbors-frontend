import api from './api'
import axios from 'axios'


type MatchStatus = 'ACCEPTED' | 'REJECTED'

const matchService = {
  getMyMatches: async () => {
    try {
      const response = await api.get('matches/my-matches')
      return response.data
    } catch (error: unknown) {
      handleError('Error fetching matches:', error)
    }
  },

  /**
   * @param initiatorChildId
   * @param targetChildId
   */
  requestMatch: async (initiatorChildId: number, targetChildId: number) => {
    try {
      const response = await api.post('/matches/request', {
        initiatorChildId,
        targetChildId,
      })
      return response.data
    } catch (error: unknown) {
      handleError('Error requesting match', error)
    }
  },

  /**
   * @param matchId - ID del match
   * @param status - 'ACCEPTED' o 'REJECTED'
   */
  respondToMatch: async (matchId: number, status: MatchStatus) => {
    try {
      const response = await api.patch(`/matches/${matchId}/respond`, null, {
        params: { status },
      })
      return response.data
    } catch (error: unknown) {
      handleError('Error responding to match:', error)
    }
  },

  /**
   * @param matchId
   */
  confirmMatch: async (matchId: number, _token: string) => {
    try {
      const response = await api.post(`/matches/${matchId}/confirm`)
      return response.data
    } catch (error: unknown) {
      handleError('Error confirming match:', error)
    }
  },
}

function handleError(context: string, error: unknown): never {
  if (axios.isAxiosError(error)) {
  
    const serverMessage = error.response?.data?.message || error.response?.data
    const finalMessage = serverMessage || error.message
    console.error(`${context} ${finalMessage}`)
    throw new Error(finalMessage)
  }

  if (error instanceof Error) {
    console.error(`${context} ${error.message}`)
    throw error
  }

  console.error(context, error)
  throw new Error('An unexpected error occurred')
}

export default matchService
