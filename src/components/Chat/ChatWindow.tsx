import React, { useState, useEffect, useRef, FormEvent } from 'react'
import {
  Send,
  UserCircle,
  Calendar,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client' // Importante para la compatibilidad con Spring
import { messageService } from '../../services/messageService'
import { userService } from '../../services/userService'
import { UserProfileDTO } from '../../types'
import matchService from '../../services/matchService'

interface ChatWindowProps {
  matchId: string | number
  currentUser: UserProfileDTO
  token: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  matchId,
  currentUser,
  token,
}) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState<string>('')
  const [myFamily, setMyFamily] = useState<any>(currentUser?.family)

  const [iAccepted, setIAccepted] = useState(false)
  const [neighborAccepted, setNeighborAccepted] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const stompClient = useRef<Client | null>(null)
  const isFullMatch = iAccepted && neighborAccepted

  // Cargar perfil si falta
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!myFamily && token) {
        try {
          const profile = await userService.getProfile(token)
          if (profile?.family) setMyFamily(profile.family)
        } catch (err) {
          console.error('Error fetching profile:', err)
        }
      }
    }
    fetchLatestProfile()
  }, [myFamily, token])

  // Cargar historial y estados de aceptación
  useEffect(() => {
    if (!matchId || matchId === 'undefined') return

    const loadHistory = async () => {
      try {
        const data = await messageService.getHistory(Number(matchId), token)
        if (data) {
          setMessages(data.messages || [])
          setIAccepted(data.userAccepted)
          setNeighborAccepted(data.neighborAccepted)
        }
      } catch (err) {
        console.error('Error loading chat history:', err)
      }
    }
    loadHistory()
  }, [matchId, token])

  // Lógica de WebSocket Corregida
  useEffect(() => {
    if (!matchId || matchId === 'undefined' || !token) return

    const client = new Client({
      // Usamos webSocketFactory para que SockJS gestione la conexión
      webSocketFactory: () =>
        new SockJS('http://localhost:8080/ws-little-neighbors'),
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Seguridad JWT
      },
      debug: str => console.log('STOMP Debug:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = frame => {
      console.log('✅ Connected to LittleNeighbors WebSocket')

      client.subscribe(`/topic/messages/${matchId}`, payload => {
        const newMessage = JSON.parse(payload.body)
        setMessages(prev => {
          const exists = prev.some(m => m.id === newMessage.id)
          return exists ? prev : [...prev, newMessage]
        })
      })
    }

    client.onStompError = frame => {
      console.error('❌ STOMP Error:', frame.headers['message'])
    }

    client.activate()
    stompClient.current = client

    return () => {
      if (client) {
        client.deactivate()
      }
    }
  }, [matchId, token])

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    // Verificamos que el cliente esté realmente conectado antes de enviar
    if (!text.trim() || !matchId || !stompClient.current?.connected) return

    const messageDTO = {
      matchId: Number(matchId),
      senderId: currentUser.id,
      content: text.trim(),
    }

    stompClient.current.publish({
      destination: `/app/chat/${matchId}`,
      body: JSON.stringify(messageDTO),
    })

    setText('')
  }

  const handleMatchAction = async () => {
    if (!matchId) return
    try {
      await matchService.confirmMatch(Number(matchId))
      setIAccepted(true)
    } catch (err) {
      console.error('Error confirming match:', err)
    }
  }

  const handleGoToSchedules = () => {
    if (!matchId) return
    navigate(`/schedules/${matchId}`)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden font-sans">
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-4">
          <ChevronLeft
            className="text-gray-400 w-6 h-6 cursor-pointer hover:text-gray-600 transition-colors"
            onClick={() => navigate(-1)}
          />
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">
              Chat
            </h2>
            <button
              onClick={handleMatchAction}
              disabled={iAccepted}
              className={`mt-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 shadow-lg ${
                isFullMatch
                  ? 'bg-green-500 text-white shadow-green-100'
                  : iAccepted
                  ? 'bg-blue-100 text-blue-600 border border-blue-200 shadow-none'
                  : 'bg-[#F28749] text-white hover:bg-gray-900 shadow-orange-100'
              }`}
            >
              {isFullMatch
                ? '✨ Official Match'
                : iAccepted
                ? '⏳ Waiting for neighbor...'
                : '🤝 Confirm Match'}
            </button>
          </div>
        </div>

        {!isFullMatch && neighborAccepted && (
          <div className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-1 rounded animate-bounce uppercase">
            They want to match!
          </div>
        )}

        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm shadow-inner uppercase">
          {myFamily?.displayName?.charAt(0) || 'U'}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 bg-white scrollbar-hide"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-300 text-xs italic py-10">
            No messages yet. Write to your neighbor!
          </p>
        )}
        {messages.map((msg, index) => {
          const isMe =
            msg.senderId === currentUser?.id ||
            msg.senderEmail === currentUser?.email
          return (
            <div
              key={msg.id || index}
              className={`flex w-full mb-4 ${
                isMe ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] px-6 py-4 text-[13px] font-bold tracking-tight leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-[#F28749] text-white rounded-[2rem] rounded-br-none'
                    : 'bg-[#F2F2F2] text-gray-700 rounded-[2rem] rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Buttons */}
      <div className="px-6 py-2 flex gap-3 bg-white">
        <button
          onClick={() => navigate('/profile')}
          className="flex-1 bg-[#F28749] text-white py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:bg-[#e0763a] transition-all active:scale-95"
        >
          <UserCircle size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            Profile
          </span>
        </button>

        <button
          disabled={!isFullMatch}
          onClick={handleGoToSchedules}
          className={`flex-1 py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 transition-all ${
            isFullMatch
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Calendar size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            {isFullMatch ? 'Schedules' : 'Pending'}
          </span>
        </button>

        <button
          onClick={() => {
            const tips = [
              "Kids' favorite games?",
              'Park this weekend?',
              'How old are your little ones?',
            ]
            setText(tips[Math.floor(Math.random() * tips.length)])
          }}
          className="flex-1 bg-[#F28749] text-white py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:bg-[#e0763a]"
        >
          <HelpCircle size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            Icebreaker
          </span>
        </button>
      </div>

      {/* Input Form */}
      <div className="p-6 bg-white border-t border-gray-50">
        <form
          onSubmit={handleSend}
          className="flex items-center bg-[#F7F7F7] rounded-full p-1.5 pl-8 border border-gray-100 shadow-inner"
        >
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-gray-600 text-sm py-3 font-bold"
          />
          <button
            type="submit"
            disabled={!text.trim() || !stompClient.current?.connected}
            className="bg-[#F28749] text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            Send <Send size={14} className="fill-current" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
