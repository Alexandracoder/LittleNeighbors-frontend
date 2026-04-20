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
import { motion, AnimatePresence } from 'framer-motion'
import { messageService } from '../../services/messageService'
import matchService from '../../services/matchService'
import { UserProfileDTO } from '../../types'
import forPregnantsBg from '../../assets/for-pregnants.png'

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
      t('chat.icebreaker1', '¿Parque favorito?'),
      t('chat.icebreaker2', '¿Dibujos preferidos?'),
      t('chat.icebreaker3', '¿Alguna alergia?'),
      t('chat.icebreaker4', '¿Jugamos este finde?'),
      t('chat.icebreaker5', '¿Juguete estrella?'),
    ]
    setText(icebreakers[Math.floor(Math.random() * icebreakers.length)])
  }

  const brand = {
    orange: '#F28749',
    cream: '#FDF8F3',
  }

  const backgroundPattern = {
    backgroundColor: brand.cream,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L5 25v25h15V35h20v15h15V25L30 5zM10 25l20-16 20 16v23h-11V33H21v15H11V25z' fill='%23F28749' fill-opacity='0.08'/%3E%3Cpath d='M15 45c0-2.5 5-5 5-5s5 2.5 5 5-5 5-5 5-5-2.5-5-5z' fill='%23F28749' fill-opacity='0.05'/%3E%3C/svg%3E")`,
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 md:p-6 relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${forPregnantsBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl flex flex-col h-[90vh] border-[6px] border-white overflow-hidden z-20">
        <div className="bg-[#FF9E91] px-6 py-5 flex items-center justify-between z-10 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-900" />
            </button>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                LITTLE CHAT
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={12} className="fill-gray-900 text-gray-900" />
                <span className="text-[10px] text-gray-900 font-bold uppercase tracking-widest">
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
            className="bg-gray-800 text-[#FF9E91] px-4 py-2 rounded-2xl text-[10px] font-black border border-[#FF9E91] shadow-sm active:scale-95 transition-all"
          >
            {iAccepted
              ? t('chat.pending', 'PENDIENTE')
              : t('chat.confirm', 'CONFIRMAR')}
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-5"
          style={backgroundPattern}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isMe =
                msg.senderId?.toString() === currentUser.id?.toString() ||
                (msg.senderEmail && msg.senderEmail === currentUser.email)
              return (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className={`w-full flex items-end gap-2 ${
                    isMe ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="flex-shrink-0 mb-1">
                    <div className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center overflow-hidden shadow-sm">
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle size={22} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`max-w-[75%] px-5 py-3 rounded-[1.5rem] text-sm font-bold border shadow-sm ${
                      isMe
                        ? 'bg-[#FF9E91] text-gray-900 border-gray-900 rounded-br-none'
                        : 'bg-white text-gray-700 border-gray-200 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-around z-10 relative">
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors group"
          >
            <UserCircle
              size={26}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {t('chat.profile', 'Perfil')}
            </span>
          </button>
          <div className="h-8 w-[1px] bg-gray-100"></div>
          <button
            onClick={() => navigate(`/schedules/${matchId}`)}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors group"
          >
            <Calendar
              size={26}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {t('chat.agenda', 'Agenda')}
            </span>
          </button>
          <div className="h-8 w-[1px] bg-gray-100"></div>
          <button
            onClick={handleIcebreaker}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors group"
          >
            <HelpCircle
              size={26}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {t('chat.icebreaker', 'Hielo')}
            </span>
          </button>
        </div>

        <div className="p-4 bg-white border-t border-gray-100 z-10 relative">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 pl-4 border border-gray-200 focus-within:border-[#F28749] transition-colors"
          >
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t('chat.placeholder', 'Escribe aquí...')}
              className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-bold"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="bg-[#FF9E91] text-gray-900 p-3 rounded-xl border border-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none"
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
