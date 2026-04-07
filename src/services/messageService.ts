const API_URL = 'http://localhost:8080/api'

export const messageService = {

  getHistory: async (matchId: string | number, token: string) => {
    const response = await fetch(`${API_URL}/messages/history/${matchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error fetching history')
    }

    return response.json()
  },

  // Enviar mensaje
  sendMessage: async (
matchId: string | number, myFamilyId: number, content: string, token: string,
  ) => {
    const response = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        matchId: Number(matchId),
        content: content.trim(),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error sending message')
    }

    return response.json()
  },
}
