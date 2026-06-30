import { EventCard } from './EventCard'
import api from '../services/api'

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
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar este evento?')) return

    try {
      await api.delete(`/events/${id}`)
      onRefresh()
    } catch (err: any) {
      console.error('Error during DELETE request:', err)
      if (err.response?.status === 403) {
        alert('Solo la familia que creó este evento puede eliminarlo.')
      } else if (err.response?.status === 404) {
        alert('Este evento ya no existe.')
        onRefresh()
      } else {
        alert('No se pudo eliminar el evento. Inténtalo de nuevo.')
      }
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
          />
        ))
      )}
    </div>
  )
}
