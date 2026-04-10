import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
} from 'react'
import { Send, UserCircle, Save, HelpCircle, ChevronLeft } from 'lucide-react'
import { messageService } from '../../services/messageService'
import { userService } from '../../services/userService'
import { UserProfileDTO } from '../../types'

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
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState<string>('')
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null)
  const [myFamily, setMyFamily] = useState<any>(currentUser?.family)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!myFamily && token) {
        try {
          const profile = await userService.getProfile(token)
          if (profile?.family) {
            setMyFamily(profile.family)
          }
        } catch (err) {
          console.error('Error fetching latest profile:', err)
        }
      }
    }
    fetchLatestProfile()
  }, [currentUser, token, myFamily])

  useEffect(() => {
    const myFamilyId = myFamily?.id

    if (!myFamilyId || !matchId || matchId === 'undefined') {
      return
    }

    const loadHistory = async () => {
      try {
        const data = await messageService.getHistory(
          Number(myFamilyId),
          Number(matchId),
          token,
        )
        if (Array.isArray(data)) {
          setMessages(data)

          const lastMsgWithMatch = [...data]
            .reverse()
            .find((m: any) => m.matchId || m.match?.id)

          if (lastMsgWithMatch) {
            setActiveMatchId(
              lastMsgWithMatch.matchId || lastMsgWithMatch.match?.id,
            )
          }
        }
      } catch (err) {
        console.error('Error loading history:', err)
      }
    }

    loadHistory()
    const interval = setInterval(loadHistory, 5000)
    return () => clearInterval(interval)
  }, [matchId, token, myFamily])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

 const handleSend = async (e: FormEvent) => {
   e.preventDefault()

   const myFamilyId = myFamily?.id

   const currentMatchId =
     activeMatchId || (matchId !== 'undefined' ? Number(matchId) : null)

   if (!text.trim() || !myFamilyId || !currentMatchId) {
     console.warn('Faltan datos para enviar:', { myFamilyId, currentMatchId })
     return
   }

   const messageContent = text.trim()
   setText('')

   try {
     const response = await messageService.sendMessage(
       Number(matchId),
       messageContent,
       token,
       currentMatchId,)

     if (response) {
       setMessages(prev => [...prev, response])

       if (!activeMatchId && response.matchId) {
         setActiveMatchId(response.matchId)
       }
     }
   } catch (err) {
     console.error('Error al enviar mensaje:', err)
     setText(messageContent)
   }
 }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden font-sans">
      <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 bg-white">
        <div className="flex items-center gap-4">
          <ChevronLeft className="text-gray-400 w-6 h-6 cursor-pointer" />
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">
            Chat {activeMatchId ? '✓' : ''}
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#F28749] flex items-center justify-center text-white font-bold text-sm">
          {myFamily?.displayName?.charAt(0) || 'U'}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 bg-white scrollbar-hide"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-300 text-xs italic py-10">
            No hay mensajes aún. ¡Escribe a tu vecino!
          </p>
        )}

        {messages.map((msg, index) => {
          const msgSenderFamilyId = msg.sender?.family?.id || msg.senderFamilyId
          const isMe = String(msgSenderFamilyId) === String(myFamily?.id)

          return (
            <div
              key={msg.id || index}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
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

      <div className="px-6 py-2 flex gap-3 bg-white">
        <button className="flex-1 bg-[#F28749] text-white py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:bg-[#e0763a] transition-all active:scale-95 shadow-lg shadow-orange-100">
          <UserCircle size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            Profile
          </span>
        </button>

        <button
          className={`flex-1 py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-lg ${
            activeMatchId
              ? 'bg-green-500 text-white'
              : 'bg-[#F28749] text-white'
          }`}
        >
          <Save size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            {activeMatchId ? 'Matched' : 'Save Match'}
          </span>
        </button>

        <button className="flex-1 bg-[#F28749] text-white py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:bg-[#e0763a] transition-all active:scale-95 shadow-lg shadow-orange-100">
          <HelpCircle size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            Icebreaker
          </span>
        </button>
      </div>

      <div className="p-6 bg-white">
        <form
          onSubmit={handleSend}
          className="flex items-center bg-[#F7F7F7] rounded-full p-1.5 pl-8 border border-gray-100 shadow-inner"
        >
          <input
            value={text}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setText(e.target.value)
            }
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-gray-600 text-sm py-3 font-bold placeholder-gray-300"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-[#F28749] text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#d97336] disabled:opacity-20"
          >
            Send <Send size={14} className="fill-current" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
