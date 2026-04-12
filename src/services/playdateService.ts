import axios from 'axios'

const API_URL = 'http://localhost:8080/api/playdates'

export const playdateService = {
  create: async (playdateData: any, token: string) => {
    const response = await axios.post(API_URL, playdateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
}
