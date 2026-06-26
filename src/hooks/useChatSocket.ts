import { useEffect, useState, useRef } from 'react'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

export const useChatSocket = (
  matchId: number,
  onMessageReceived: (msg: any) => void,
) => {
  const [connected, setConnected] = useState(false)
  const stompClient = useRef<Stomp.Client | null>(null)

  useEffect(() => {

    const WS_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

    const socket = new SockJS(`${WS_BASE_URL}/ws-little-neighbors`)
    stompClient.current = Stomp.over(socket)

    stompClient.current.connect(
      {},
      () => {
        setConnected(true)

        stompClient.current?.subscribe(
          `/topic/messages/${matchId}`,
          (          payload: { body: string }) => {
            const newMessage = JSON.parse(payload.body)
            onMessageReceived(newMessage)
          },
        )
      },
      (      error: any) => {
        console.error('Error en WebSocket:', error)
        setConnected(false)
      },
    )


    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect(() => {})
      }
    }
  }, [matchId])


  const sendMessage = (messageData: any) => {
    if (stompClient.current && connected) {
      stompClient.current.send(
        `/app/chat/${matchId}`,
        {},
        JSON.stringify(messageData),
      )
    }
  }

  return { connected, sendMessage }
}
