import api from './api'
import { MessageDTO } from '../types'

export const messageService = {
  getHistory: async (
    matchId: number,
    signal?: AbortSignal,
  ): Promise<MessageDTO[]> => {
    if (!matchId || isNaN(matchId)) {
      throw new Error('ID de Match no válido para obtener el historial')
    }

    const response = await api.get<MessageDTO[]>(
      `/messages/history/match/${matchId}`,
      {
        signal,
      },
    )

    return response.data
  },

  sendMessage: async (
    matchId: number,
    content: string,
  ): Promise<MessageDTO> => {
    const response = await api.post<MessageDTO>('/messages/send', {
      matchId: Number(matchId),
      content: content.trim(),
    })

    return response.data
  },
}
