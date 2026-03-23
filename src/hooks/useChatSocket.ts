import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { MessageDTO } from '../types'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useChatSocket = (familyId: string | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!familyId) return

    // Conectar con el token de auth si lo tienes
    const newSocket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
      query: { room: familyId },
    })

    newSocket.on('connect', () => setIsConnected(true))

    // Escuchar mensajes nuevos
    newSocket.on('new_message', (message: MessageDTO) => {
      setMessages(prev => [...prev, message])
    })

    setSocket(newSocket)

    // Limpieza al desmontar el componente
    return () => {
      newSocket.disconnect()
    }
  }, [familyId])

  const sendMessage = (content: string) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        receiverId: familyId,
        content,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return { messages, sendMessage, isConnected, setMessages }
}
