const API_URL = 'http://localhost:8080/api/messages'

export const messageService = {
  // Obtener historial
  getHistory: async (matchId, token) => {
    const response = await fetch(`${API_URL}/history/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.json()
  },

  // Enviar mensaje
  sendMessage: async (matchId, senderId, content, token) => {
    const response = await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ matchId, senderId, content }),
    })
    return response.json()
    },
  
  getMyMatches: async (token) => {
        const response = await fetch(`${API_URL}/matches/my-matches`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error("Error al obtener matches");
        return await response.json();
    }
};

