import { useParams } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import { useAuth } from '../context/AuthContext'
import ChatWindow from './Chat/ChatWindow'

export default function MessagesPage() {
  const { recipientId } = useParams<{ recipientId: string }>()
  const { user, token } = useAuth()

  if (!user || !token || !recipientId) {
    return null
  }

  return (
    <MainLayout title="Chat" subtitle="Neighbors" backgroundImage="">
      <ChatWindow
        matchId={Number(recipientId)}
        currentUser={user}
        token={token}
      />
    </MainLayout>
  )
}
