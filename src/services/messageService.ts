const API_URL = 'http://localhost:8080/api'

export const messageService = {
  getHistory: async (user1Id: number, user2Id: number, token: string) => {
    const u1 = Number(user1Id)
    const u2 = Number(user2Id)

    if (isNaN(u1) || isNaN(u2)) {
      throw new Error('Invalid user IDs provided for history')
    }

    const response = await fetch(
      `${API_URL}/messages/history?user1Id=${u1}&user2Id=${u2}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error fetching history')
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
