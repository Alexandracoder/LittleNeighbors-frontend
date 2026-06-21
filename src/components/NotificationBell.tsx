import { useState, useEffect } from 'react'
import { Bell, Calendar, Heart, MessageCircle, X } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { notificationApi } from '../services/api'
import { useTranslation } from 'react-i18next'

interface Notification {
  id: number
  title: string
  message: string
  type: 'EVENT_CREATED' | 'MATCH_SUCCESS' | 'CHAT_MESSAGE' | 'SYSTEM'
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const data = await notificationApi.getMyNotifications()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      } catch (err) {
        console.error(err)
      }
    }

    loadInitial()

    const token = localStorage.getItem('token')
    const WS_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws-little-neighbors`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        client.subscribe('/user/queue/notifications', message => {
          const newNotif = JSON.parse(message.body)
          setNotifications(prev => [newNotif, ...prev])
          setUnreadCount(prev => prev + 1)
        })
      },
    })

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [])

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n)),
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'EVENT_CREATED':
        return (
          <Calendar className="w-4 h-4 text-orange-400" aria-hidden="true" />
        )
      case 'MATCH_SUCCESS':
        return <Heart className="w-4 h-4 text-pink-400" aria-hidden="true" />
      default:
        return (
          <MessageCircle className="w-4 h-4 text-blue-400" aria-hidden="true" />
        )
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={
          unreadCount > 0
            ? `You have ${unreadCount} notifications`
            : 'Notifications'
        }
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <Bell
          className={`w-5 h-5 transition-colors ${
            unreadCount > 0
              ? 'text-orange-500 animate-pulse'
              : 'text-white/60 group-hover:text-white'
          }`}
        />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-950"
            role="status"
            aria-live="polite"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-4 w-80 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-label="Notifications panel"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {t('notifications.title')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            <div
              className="max-h-[400px] overflow-y-auto"
              role="log"
              aria-live="polite"
            >
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-sm italic">
                  {t('notifications.empty')}
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 flex gap-3 ${
                      !notification.isRead ? 'bg-orange-500/5' : 'opacity-60'
                    }`}
                  >
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white mb-1">
                        {notification.title}
                      </p>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[9px] text-white/30 mt-2 font-mono">
                        {new Date(notification.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div
                        className="w-2 h-2 bg-orange-500 rounded-full mt-2"
                        aria-label="Unread"
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-white/5 text-center border-t border-white/5">
              <button className="text-[10px] font-black text-orange-500 uppercase tracking-tighter hover:text-orange-400">
                {t('notifications.viewAll')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
