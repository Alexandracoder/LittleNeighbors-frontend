import { EventCard } from './EventCard'
import { useTranslation } from 'react-i18next'

interface EventListProps {
  events: any[]
  neighborhoods: any[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onEdit: (event: any) => void
}

export const EventList = ({
  events,
  neighborhoods,
  loading,
  error,
  onRefresh,
  onEdit,
}: EventListProps) => {
  const { t } = useTranslation()
  const token = localStorage.getItem('accessToken')

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('common.back'))) return

    try {
      const response = await fetch(`http://localhost:8080/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert(t('auth.login.error'))
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <p className="font-black uppercase tracking-widest text-xs animate-pulse text-brand-orange">
          {t('loading')}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-bold">{t('error')}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {events.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
          <p className="text-white/40 font-bold italic text-lg px-6">
            {t('Description')}
          </p>
        </div>
      ) : (
        events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            neighborhoods={neighborhoods}
            onDelete={() => handleDelete(event.id)}
            onEdit={() => onEdit(event)}
          />
        ))
      )}
    </div>
  )
}
