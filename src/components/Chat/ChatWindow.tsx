import { useState, useEffect, useRef, FormEvent } from 'react'
import {
  Send,
  UserCircle,
  Calendar,
  Sparkles,
  ChevronLeft,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import api, { WS_BASE_URL } from '../../services/api'
import matchService from '../../services/matchService'
import forPregnantsBg from '../../assets/for-pregnants.png'

interface ChatUser {
  id: number | string
  email: string
  name?: string
  verificationStatus?: string
}

interface ChatWindowProps {
  matchId: string | number
  currentUser: ChatUser
  token: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  matchId,
  currentUser,
  token,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState<string>('')
  const [iAccepted, setIAccepted] = useState(false)
  const [matchStatus, setMatchStatus] = useState<string>('PENDING')
  const [isConnected, setIsConnected] = useState(false)
  const [neighborName, setNeighborName] = useState<string>('')
  const [matchInterests, setMatchInterests] = useState<string[]>([])
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const stompClient = useRef<Client | null>(null)

  useEffect(() => {
    const loadHistory = async () => {
      if (!matchId) return
      try {
        const response = await api.get(`/messages/history/match/${matchId}`)
        const data = response.data
        setMessages(Array.isArray(data) ? data : data.messages || [])

        const myMatches = await matchService.getMyMatches()
        if (myMatches && Array.isArray(myMatches)) {
          const currentMatch = myMatches.find(
            (m: any) => m.matchId === Number(matchId),
          )
          if (currentMatch) {
            setMatchStatus(currentMatch.status)
            setIAccepted(currentMatch.status === 'ACCEPTED')
            setNeighborName(
              currentMatch.theirFamilyName ||
                t('chat.defaultNeighbor', 'Familia Vecina'),
            )

            if (currentMatch.sharedInterests) {
              setMatchInterests(
                currentMatch.sharedInterests.map((i: any) => i.name || i),
              )
            } else {
              setMatchInterests(['Bici', 'Naturaleza', 'Lego'])
            }
          }
        }
      } catch (err) {
        console.error('Error loading chat metadata:', err)
      }
    }
    loadHistory()
  }, [matchId, t])

  useEffect(() => {
    if (!matchId || !token) return


    const socketUrl = `${WS_BASE_URL}/ws-little-neighbors`

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setIsConnected(true)
        client.subscribe(`/topic/messages/${matchId}`, payload => {
          const newMessage = JSON.parse(payload.body)

          if (newMessage.status) {
            setMatchStatus(newMessage.status)
          }

          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        })
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: frame => {
        console.error('Broker reported error: ' + frame.headers['message'])
        setIsConnected(false)
      },
    })

    client.activate()
    stompClient.current = client

    return () => {
      if (client.active) client.deactivate()
    }
  }, [matchId, token])

  useEffect(() => {
    if (scrollRef.current) {
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [messages])

  const formatTime = (dateInput: any) => {
    const date = new Date(dateInput)
    return date.toLocaleTimeString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
    setIsGeneratingIcebreaker(true)
    setTimeout(() => {
      const isEs = i18n.language === 'es'
      const topics =
        matchInterests.length > 0
          ? matchInterests.join(', ')
          : 'games and fun activities'

      const promptsEs = [
        `¡Hola ${neighborName}! Veo que compartimos el gusto por: ${topics}. ¿Os apetece que quedemos este finde con los peques para dar una vuelta en bici o ir a jugar al río Turia?`,
        `¡Qué bueno conectar! Como a nuestros peques les encanta el mundo de (${topics}), ¿conocéis algún parque chulo por la zona para organizar una tarde de juegos?`,
        `¡Hola vecinos! Un pajarito me ha dicho que os gusta: ${topics}. ¿Hacemos un plan de juego este sábado por la mañana?`,
      ]

      const promptsEn = [
        `Hi ${neighborName}! I see we share interests in: ${topics}. Would you like to meet up with the kids this weekend for a bike ride or to play around the Turia park?`,
        `Great connecting with you! Since our little ones love (${topics}), do you know any cool playground nearby to set up a quick playdate?`,
        `Hey neighbors! A little bird told me that you enjoy: ${topics}. Should we arrange a fun outdoor morning game this Saturday?`,
      ]

      const selection = isEs ? promptsEs : promptsEn
      setText(selection[Math.floor(Math.random() * selection.length)])
      setIsGeneratingIcebreaker(false)
    }, 800)
  }

  const backgroundPattern = {
    backgroundColor: '#FDF8F3',
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
        aria-hidden="true"
      />
      <main
        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl flex flex-col h-[90vh] border-[6px] border-white overflow-hidden z-20"
        role="main"
      >
        <header className="bg-[#FF9E91] px-6 py-5 flex items-center justify-between z-10 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-900" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                {neighborName
                  ? `CHAT CON ${neighborName}`
                  : t('chat.title', 'LITTLE CHAT')}
              </h1>
              <div className="flex items-center gap-1.5 mt-1" role="status">
                {isConnected ? (
                  <Wifi size={12} className="text-green-600" />
                ) : (
                  <WifiOff size={12} className="text-red-600" />
                )}
                <span className="text-[10px] text-gray-900 font-bold uppercase tracking-widest">
                  {isConnected
                    ? t('chat.live', 'LIVE')
                    : t('chat.offline', 'OFFLINE')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await matchService.confirmMatch(
                  Number(matchId),
                  currentUser.email,
                )
                setIAccepted(true)
                if (stompClient.current?.connected) {
                  stompClient.current.publish({
                    destination: `/app/chat/${matchId}`,
                    body: JSON.stringify({
                      matchId: Number(matchId),
                      senderId: currentUser.id,
                      content:
                        '✅ ' +
                        t(
                          'chat.confirmedMessage',
                          'I have confirmed the match!',
                        ),
                    }),
                  })
                }
              } catch (e) {
                console.error(e)
              }
            }}
            className="bg-gray-800 text-[#FF9E91] px-4 py-2 rounded-2xl text-[10px] font-black border border-[#FF9E91] shadow-sm active:scale-95 transition-all"
          >
            {matchStatus === 'ACCEPTED'
              ? t('chat.match_active', 'MATCH! 🌟')
              : iAccepted
              ? t('chat.pending', 'PENDING')
              : t('chat.confirm', 'MATCH?')}
          </button>
        </header>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-5"
          style={backgroundPattern}
        >
          <AnimatePresence initial={false}>
            {messages.length > 0 ? (
              messages.map((msg, idx) => {
                const isMe =
                  msg.senderId === currentUser.id ||
                  msg.senderEmail === currentUser.email ||
                  msg.senderId?.toString() === currentUser.id?.toString()
                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
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
                    <div className="flex flex-col max-w-[75%] gap-0.5">
                      <div
                        className={`px-5 py-3 rounded-[1.5rem] text-sm font-bold border shadow-sm ${
                          isMe
                            ? 'bg-[#FF9E91] text-gray-900 border-gray-900 rounded-br-none'
                            : 'bg-white text-gray-700 border-gray-200 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span
                        className={`text-[9px] font-medium text-gray-400 px-2 ${
                          isMe ? 'text-right' : 'text-left'
                        }`}
                      >
                        {msg.timestamp
                          ? formatTime(msg.timestamp)
                          : formatTime(new Date())}
                      </span>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium italic">
                {t('chat.noMessages', 'No messages yet...')}
              </div>
            )}
          </AnimatePresence>
        </div>
        <nav className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-around z-10 relative">
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <UserCircle size={26} />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {t('navigation.profile', 'Profile')}
            </span>
          </button>
          <div className="h-8 w-[1px] bg-gray-100" />
          <button
            onClick={() => navigate(`/schedules/${matchId}`)}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <Calendar size={26} />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {t('playdates.page.agendaHighlight', 'Agenda')}
            </span>
          </button>
          <div className="h-8 w-[1px] bg-gray-100" />
          <button
            onClick={handleIcebreaker}
            disabled={isGeneratingIcebreaker}
            className={`flex flex-col items-center gap-1 transition-all ${
              isGeneratingIcebreaker
                ? 'text-[#F28749] animate-pulse scale-105'
                : 'text-gray-400 hover:text-[#F28749]'
            }`}
          >
            <Sparkles
              size={26}
              className={
                isGeneratingIcebreaker ? 'animate-spin text-[#F28749]' : ''
              }
            />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {isGeneratingIcebreaker
                ? t('chat.aiThinking', 'IA Pensando...')
                : t('chat.icebreaker', 'Icebreaker IA')}
            </span>
          </button>
        </nav>
        <footer className="p-4 bg-white border-t border-gray-100 z-10 relative">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 pl-4 border border-gray-200 focus-within:border-[#F28749] transition-colors"
          >
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t('chat.inputPlaceholder', 'Type...')}
              className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-bold disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!text.trim() || !isConnected}
              className="bg-[#FF9E91] text-gray-900 p-3 rounded-xl border border-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Send size={18} strokeWidth={3} />
            </button>
          </form>
        </footer>
      </main>
    </div>
  )
}

export default ChatWindow
