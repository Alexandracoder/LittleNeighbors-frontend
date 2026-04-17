import React, { useState, useEffect, useRef, FormEvent } from 'react'
import {
  Send,
  UserCircle,
  Calendar,
  HelpCircle,
  ChevronLeft,
  Star,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useTranslation } from 'react-i18next'
import { messageService } from '../../services/messageService'
import matchService from '../../services/matchService'
import { UserProfileDTO } from '../../types'

import chatBgPattern from '../../assets/chat.png'
import mainAppBg from '../../assets/for-pregnants.png'

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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState<string>('')
  const [iAccepted, setIAccepted] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const stompClient = useRef<Client | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!matchId || !token) return
      try {
        const data = await messageService.getHistory(Number(matchId), token)
        if (data) {
          setMessages(data.messages || [])
          setIAccepted(data.userAccepted || false)
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [matchId, token])

  useEffect(() => {
    if (!matchId || !token) return
    const client = new Client({
      webSocketFactory: () =>
        new SockJS('http://localhost:8080/ws-little-neighbors'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/topic/messages/${matchId}`, payload => {
          const newMessage = JSON.parse(payload.body)
          setMessages(prev => [...prev, newMessage])
        })
      },
    })
    client.activate()
    stompClient.current = client
    return () => {
      if (client.active) client.deactivate()
    }
  }, [matchId, token])

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !stompClient.current?.connected) return
    stompClient.current.publish({
      destination: `/app/chat/${matchId}`,
      body: JSON.stringify({
        matchId: Number(matchId),
        senderId: currentUser.id,
        content: text.trim(),
      }),
    })
    setText('')
  }

  const handleIcebreaker = () => {
    const icebreakers = [
      '¿Parque favorito?',
      '¿Dibujos preferidos?',
      '¿Alguna alergia?',
      '¿Jugamos este finde?',
      '¿Juguete estrella?',
    ]
    setText(icebreakers[Math.floor(Math.random() * icebreakers.length)])
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-2 md:p-6"
      style={{
        backgroundImage: `url(${mainAppBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative w-full max-w-2xl bg-white/90 rounded-[2.5rem] shadow-2xl flex flex-col h-[90vh] border-2 border-white overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#F28749] px-6 py-4 flex items-center justify-between border-b-4 border-gray-900 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-black/10 rounded-full"
            >
              <ChevronLeft size={24} className="text-gray-900" />
            </button>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase italic leading-none">
                CHAT
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={10} className="fill-gray-900" />
                <span className="text-[10px] text-gray-900 font-black uppercase tracking-widest">
                  Live
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await matchService.confirmMatch(Number(matchId))
                setIAccepted(true)
              } catch (e) {}
            }}
            className="bg-gray-900 text-[#F28749] px-4 py-2 rounded-xl text-[10px] font-black border-2 border-[#F28749]"
          >
            {iAccepted ? 'PENDIENTE' : 'CONFIRMAR'}
          </button>
        </div>

        {/* MENSAJES */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{
            backgroundImage: `url(${chatBgPattern})`,
            backgroundSize: '250px',
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
          }}
        >
          {messages.map((msg, idx) => {
            // --- BLOQUE DE LÓGICA ISME REFORZADA ---
            const isMe =
              msg.senderId?.toString() === currentUser.id?.toString() ||
              (msg.senderEmail && msg.senderEmail === currentUser.email)
            // ---------------------------------------

            return (
              <div
                key={idx}
                className={`w-full flex ${
                  isMe ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-black shadow-md border-2 ${
                    isMe
                      ? 'bg-[#F28749] text-gray-900 border-gray-900 rounded-tr-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-gray-600 border-gray-200 rounded-tl-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}
        </div>

        {/* ACTION BAR */}
        <div className="px-4 py-3 bg-white border-t-2 border-gray-100 flex items-center justify-around">
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 text-gray-900"
          >
            <UserCircle size={24} strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase">Perfil</span>
          </button>
          <div className="h-8 w-[2px] bg-gray-50"></div>
          <button
            onClick={() => navigate(`/schedules/${matchId}`)}
            className="flex flex-col items-center gap-1 text-gray-900"
          >
            <Calendar size={24} strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase">Agenda</span>
          </button>
          <div className="h-8 w-[2px] bg-gray-50"></div>
          <button
            onClick={handleIcebreaker}
            className="flex flex-col items-center gap-1 text-gray-900"
          >
            <HelpCircle size={24} strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase">Hielo</span>
          </button>
        </div>

        {/* INPUT */}
        <div className="p-4 bg-white border-t-2 border-gray-50">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-gray-100 rounded-xl p-1.5 pl-4 border-2 border-gray-200 shadow-inner"
          >
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Mensaje..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-bold"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="bg-[#F28749] text-gray-900 p-3 rounded-xl border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Send size={18} strokeWidth={3} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
