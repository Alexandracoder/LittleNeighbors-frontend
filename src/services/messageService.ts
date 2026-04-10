const API_URL = 'http://localhost:8080/api'

export const messageService = {
  getHistory: async (familyId: number, matchId: number, token: string) => {
    if (isNaN(familyId) || isNaN(matchId)) {
      throw new Error('Invalid IDs provided for history')
    }

    const response = await fetch(
      `${API_URL}/messages/history/${familyId}/${matchId}`,
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

  sendMessage: async (
    receiverId: number,
    content: string,
    token: string,
    matchId?: number | null,
  ) => {
    const response = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiverId: Number(receiverId),
        content: content.trim(),
        matchId: matchId ? Number(matchId) : null,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error sending message')
    }

    return response.json()
  },
}
