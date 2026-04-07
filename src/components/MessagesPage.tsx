import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import ChatWindow from './Chat/ChatWindow'
import { useAuth } from '../context/AuthContext'
import chatBg from '../assets/neighborhood-picnic.png'
import { ArrowLeft } from 'lucide-react'

export default function MessagesPage() {
  const navigate = useNavigate()
  const { matchId } = useParams<{ matchId: string }>()

  const { user, token, familyEntity } = useAuth()

  const activeMatchId = matchId || familyEntity?.id?.toString() || '1'

  if (!user || !token) return null

  return (
    <MainLayout
      backgroundImage={chatBg}
      title="Inbox"
      subtitle="Chatting with the hood"
      showGlassCard={true}
    >
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-50">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-[#333D47] group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#333D47]">
              Neighbors Chat
            </h2>
          </div>
        </div>

        {/* Pasamos 'user' que es el objeto que TS reconoce */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            matchId={Number(activeMatchId)}
            currentUser={{
              ...user,
              id: user.id || '',
              family: user.family || null
            }}
            token={token}
          />
        </div>
      </div>
    </MainLayout>
  )
}
