import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
} from 'react'
import {
  Send,
  UserCircle,
  Calendar,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

  const isFullMatch = iAccepted && neighborAccepted

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!myFamily && token) {
        try {
          const profile = await userService.getProfile(token)
          if (profile?.family) {
            setMyFamily(profile.family)
          }
        } catch (err) {
          console.error(err)
        }
      }
    }
    fetchLatestProfile()
  }, [token, myFamily])

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
     console.error('Error loading chat data:', err)
   }
 }
    loadHistory()
    const interval = setInterval(loadHistory, 5000)
    return () => clearInterval(interval)
  }, [matchId, token])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !matchId || matchId === 'undefined') return

    const messageContent = text.trim()
    setText('')

    try {
      const response = await messageService.sendMessage(
        Number(matchId),
        messageContent,
        token,
      )
      if (response) {
        setMessages(prev => [...prev, response])
      }
    } catch (err) {
      console.error(err)
      setText(messageContent)
    }
  }

const handleMatchAction = async () => {
  if (!matchId || !token) return

  try {
  
    await matchService.confirmMatch(Number(matchId), token)
  
    setIAccepted(true)
    console.log('Match confirmed successfully')
  } catch (err) {
    console.error('Error confirming match:', err)
    alert('Could not confirm match. Please try again.')
  }
}

  const handleIcebreaker = () => {
    const icebreakers = [
      "Hey! What are your kids' favorite games?",
      'Hi neighbor! Would you like to meet at the park this weekend?',
      'Hello! How old are your little ones?',
    ]
    const random = icebreakers[Math.floor(Math.random() * icebreakers.length)]
    setText(random)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden font-sans">
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
              {isFullMatch ? (
                <>✨ Official Match</>
              ) : iAccepted ? (
                <>⏳ Waiting for neighbor...</>
              ) : (
                '🤝 Confirm Match'
              )}
            </button>
          </div>
        </div>

        {!isFullMatch && neighborAccepted && (
          <div className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-1 rounded animate-bounce uppercase">
            They want to match!
          </div>
        )}

        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm shadow-inner">
          {myFamily?.displayName?.charAt(0) || 'U'}
        </div>
      </div>

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
          const isMe = msg.senderEmail === currentUser?.email

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
                    ? 'bg-[#F28749] text-white rounded-[2rem] rounded-br-none ml-auto'
                    : 'bg-[#F2F2F2] text-gray-700 rounded-[2rem] rounded-bl-none mr-auto'
                }`}
              >
                {msg.content}

                {/* Debug opcional para estar seguros */}
                <div className="text-[7px] mt-1 opacity-30">
                  {isMe ? 'Sent by you' : `From: ${msg.senderEmail}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-6 py-2 flex gap-3 bg-white">
        <button
          onClick={() => navigate('/profile')}
          className="flex-1 bg-[#F28749] text-white py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:bg-[#e0763a] transition-all active:scale-95 shadow-lg shadow-orange-100"
        >
          <UserCircle size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            Profile
          </span>
        </button>

        <button
          disabled={!isFullMatch}
          onClick={() => navigate('/add-playdate', { state: { matchId } })}
          className={`flex-1 py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 transition-all shadow-lg ${
            isFullMatch
              ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
          }`}
        >
          <Calendar size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            {isFullMatch ? 'Schedule' : 'Pending Match'}
          </span>
        </button>

        <button
          onClick={handleIcebreaker}
          className="flex-1 bg-[#F28749] text-white py-3 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:bg-[#e0763a] transition-all active:scale-95 shadow-lg shadow-orange-100"
        >
          <HelpCircle size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            Icebreaker
          </span>
        </button>
      </div>

      <div className="p-6 bg-white border-t border-gray-50">
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
            className="bg-[#F28749] text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#d97336] disabled:opacity-20 transition-all"
          >
            Send <Send size={14} className="fill-current" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
