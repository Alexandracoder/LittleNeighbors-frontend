import React, { useState, useEffect } from 'react'
import { messageService } from '../../services/messageService'
import './ChatWindow.css'

const ChatWindow = ({ matchId, currentUser, token }) => {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  // Cargar mensajes al inicio y cada 5 segundos (Polling)
  useEffect(() => {
    const load = async () => {
      const data = await messageService.getHistory(matchId, token)
      setMessages(data)
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [matchId, token])

  const handleSend = async e => {
    e.preventDefault()
    if (!text.trim()) return

    try {
      const sentMsg = await messageService.sendMessage(
        matchId,
        currentUser.id,
        text,
        token,
      )
      setMessages([...messages, sentMsg]) // Actualización inmediata en pantalla
      setText('')
    } catch (err) {
      console.error('Error al enviar:', err)
    }
  }

  return (
    <div className="chat-box">
      <div
        className="messages-list"
        style={{ height: '300px', overflowY: 'scroll', padding: '10px' }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.senderId === currentUser.id ? 'right' : 'left',
              margin: '10px',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '15px',
                backgroundColor:
                  msg.senderId === currentUser.id ? '#FF8C00' : '#E0E0E0',
                color: msg.senderId === currentUser.id ? 'white' : 'black',
              }}
            >
              <small style={{ display: 'block', fontSize: '10px' }}>
                {msg.senderFirstName}
              </small>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe a tus vecinos..."
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}

export default ChatWindow
