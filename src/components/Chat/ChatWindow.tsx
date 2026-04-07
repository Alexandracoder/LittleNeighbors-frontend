import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
} from 'react'
import { Send, UserCircle, Save, HelpCircle, ChevronLeft } from 'lucide-react'
import { messageService } from '../../services/messageService'
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
  const scrollRef = useRef<HTMLDivElement>(null)

  // Usamos el ID del usuario directamente para la lógica "isMe"
  const myUserId = currentUser?.id

  useEffect(() => {
    const loadHistory = async () => {
      if (!matchId || !token) return
      try {
        const data = await messageService.getHistory(matchId, token)
        // Evitamos el [] vacío si el backend falla en la serialización
        setMessages(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error loading history:', err)
      }
    }

    loadHistory()
    const interval = setInterval(loadHistory, 4000)
    return () => clearInterval(interval)
  }, [matchId, token])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !myUserId || !matchId) return

    const messageContent = text.trim()
    setText('')

    try {
      const response = await messageService.sendMessage(
        matchId,
        myUserId,
        messageContent,
        token,
      )

      // Si el backend devuelve [] o null pero el status es 200, creamos el objeto local
      const newMessage =
        !response || Array.isArray(response) || !response.content
          ? {
              id: Date.now(),
              content: messageContent,
              senderId: myUserId,
              sentAt: new Date().toISOString(),
            }
          : response

      setMessages(prev => [...prev, newMessage])
    } catch (err) {
      console.error('Error sending:', err)
      setText(messageContent)
    }
  }

  return (
    /* CONTENEDOR PRINCIPAL: Blanco, con bordes muy redondeados y sin bordes negros */
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-none font-sans">
      {/* HEADER: Siguiendo la foto con el botón de volver y título en negrita */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 bg-white">
        <div className="flex items-center gap-4">
          <ChevronLeft className="text-gray-400 w-6 h-6 cursor-pointer" />
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">
            Chat
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#F28749] flex items-center justify-center text-white font-bold text-sm">
          {currentUser.family?.displayName?.charAt(0) || 'U'}
        </div>
      </div>

      {/* ÁREA DE MENSAJES: Fondo blanco y burbujas con mucho aire */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 bg-white scrollbar-hide"
      >
        {messages.map((msg, index) => {
          const isMe = String(msg.senderId) === String(myUserId)
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

      {/* BOTONES DE ACCIÓN RÁPIDA: Los botones naranjas pequeños de la foto */}
      <div className="px-6 py-2 flex gap-3 bg-white">
        <button className="flex-1 bg-[#F28749] text-white py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:bg-[#e0763a] transition-all active:scale-95 shadow-lg shadow-orange-100">
          <UserCircle size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none text-center">
            View
            <br />
            Profile
          </span>
        </button>
        <button className="flex-1 bg-[#F28749] text-white py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:bg-[#e0763a] transition-all active:scale-95 shadow-lg shadow-orange-100">
          <Save size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none text-center">
            Save
            <br />
            Match
          </span>
        </button>
        <button className="flex-1 bg-[#F28749] text-white py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:bg-[#e0763a] transition-all active:scale-95 shadow-lg shadow-orange-100">
          <HelpCircle size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none text-center">
            Break
            <br />
            The Ice
          </span>
        </button>
      </div>

      {/* INPUT: Cápsula gris claro con botón SEND integrado */}
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
            className="bg-[#F28749] text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[#d97336] transition-colors disabled:opacity-20"
          >
            Send <Send size={14} className="fill-current" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
