import api from './api'

const matchService = {
    getMyMatches: async () => {
    try {
      const response = await api.get('/matches/my-matches')
      return response.data
    } catch (error) {
      console.error('Error fetching matches:', error)
      throw error
    }
  },

  /**
   * @param {number} initiatorChildId - ID del hijo del usuario actual.
   * @param {number} targetChildId - ID del niño con el que se quiere conectar.
   */
  requestMatch: async (initiatorChildId, targetChildId) => {
    try {
      const response = await api.post('/matches/request', {
        initiatorChildId,
        targetChildId,
      })
      return response.data
    } catch (error) {
      const message = error.response?.data || 'Error requesting match'
      throw new Error(message)
    }
  },

  /**
   * @param {number} matchId
   * @param {string} status - 'ACCEPTED' o 'REJECTED'
   */
  respondToMatch: async (matchId, status) => {
    try {
      const response = await api.patch(`/matches/${matchId}/respond`, null, {
        params: { status },
      })
      return response.data
    } catch (error) {
      console.error('Error responding to match:', error)
      throw error
    }
  },
}

export default matchService
