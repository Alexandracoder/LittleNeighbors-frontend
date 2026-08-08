import { useState } from 'react'
import { EventCard } from './EventCard'
import api from '../services/api'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface EventListProps {
  events: any[]
  neighborhoods: any[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onEdit: (event: any) => void
  onHide: (id: number) => void
  onAttendChange: (id: number, isAttending: boolean) => void
  myFamilyId: number | null
}

export const EventList = ({
  events,
  neighborhoods,
  loading,
  error,
  onRefresh,
  onEdit,
  onHide,
  onAttendChange,
  myFamilyId,
}: EventListProps) => {
  const { t } = useTranslation()
  const [attendLoadingId, setAttendLoadingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('events.card.confirmDelete', '¿Seguro que quieres eliminar este evento?'))) return

    try {
      await api.delete(`/events/${id}`)
      onRefresh()
    } catch (err: any) {
      console.error('Error during DELETE request:', err)
      if (err.response?.status === 403) {
        toast.error(t('events.card.deleteForbidden', 'Solo la familia que creó este evento puede eliminarlo.'))
      } else if (err.response?.status === 404) {
        toast.error(t('events.card.deleteNotFound', 'Este evento ya no existe.'))
        onRefresh()
      } else {
        toast.error(t('events.card.deleteError', 'No se pudo eliminar el evento. Inténtalo de nuevo.'))
      }
    }
  }

  const handleToggleAttend = async (id: number) => {
    const event = events.find(e => e.id === id)
    if (!event) return

    const wasAttending = event.isAttending ?? false
    setAttendLoadingId(id)

    try {
      if (wasAttending) {
        await api.delete(`/events/${id}/attend`)
      } else {
        await api.post(`/events/${id}/attend`)
      }
      onAttendChange(id, !wasAttending)
    } catch (err: any) {
      console.error('Error al apuntarse/desapuntarse del evento:', err)
      const backendMessage =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message

      if (err.response?.status === 404) {
        toast.error(t('events.card.attendNotFound', 'Este evento ya no existe.'))
        onRefresh()
      } else if (
        typeof backendMessage === 'string' &&
        backendMessage.toLowerCase().includes('verified')
      ) {
        toast.error(
          t(
            'events.card.attendVerificationRequired',
            'Necesitas verificar tu identidad para apuntarte a eventos.',
          ),
        )
      } else {
        toast.error(t('events.card.attendError', 'No se pudo actualizar tu asistencia. Inténtalo de nuevo.'))
      }
    } finally {
      setAttendLoadingId(null)
    }
  }

  if (loading)
    return <p className="text-center font-bold p-10">Loading events...</p>
  if (error) return <p className="text-red-500 text-center p-10">{error}</p>

  return (
    <div className="grid gap-4">
      {events.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No upcoming events in Valencia. Create the first one!
        </p>
      ) : (
        events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            neighborhoods={neighborhoods}
            onDelete={() => handleDelete(event.id)}
            onEdit={() => onEdit(event)}
            onHide={() => onHide(event.id)}
            onToggleAttend={() => handleToggleAttend(event.id)}
            isOwner={myFamilyId != null && event.creatorFamilyId === myFamilyId}
            attendLoading={attendLoadingId === event.id}
          />
        ))
      )}
    </div>
  )
}
