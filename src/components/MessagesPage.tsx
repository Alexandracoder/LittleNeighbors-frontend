// MessagesPage.tsx
import { useParams } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import { useAuth } from '../context/AuthContext'
import ChatWindow from './Chat/ChatWindow'

export default function MessagesPage() {
  // Cambiamos el nombre para que sea semántico: es el ID del vecino
  const { recipientId } = useParams<{ recipientId: string }>()
  const { user, token } = useAuth()

  // Si no hay ID en la URL, el componente no sabe con quién hablar
  if (!user || !token || !recipientId) {
    console.warn('Falta el ID del destinatario en la URL')
    return null
  }

  return (
    <MainLayout title="Chat" subtitle="Vecinos" children={undefined} backgroundImage={''}>
      <ChatWindow
        neighborId={Number(recipientId)} // Pasamos el ID del vecino
        currentUser={user}
        token={token}
      />
    </MainLayout>
  )
}
