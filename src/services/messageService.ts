const API_URL = 'http://localhost:8080/api'

export const messageService = {
  getHistory: async (matchId: number, token: string) => {
    if (!matchId || isNaN(matchId)) {
      throw new Error('Invalid Match ID provided for history')
    }

    const response = await fetch(
      `${API_URL}/messages/history/match/${matchId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error detallado del servidor:', errorText)
      throw new Error(
        `Error ${response.status}: ${errorText || 'Error fetching history'}`,
      )
    }

    return response.json()
  },

  sendMessage: async (matchId: number, content: string, token: string) => {
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
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error sending message')
    }

    return response.json()
  },
}
