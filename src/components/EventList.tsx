import { EventCard } from './EventCard'

interface EventListProps {
  events: any[]
  neighborhoods: any[] // 👈 AÑADIDO: Recibimos la lista de barrios del padre
  loading: boolean
  error: string | null
  onRefresh: () => void
  onEdit: (event: any) => void
}

export const EventList = ({
  events,
  neighborhoods, // 👈 RECIBIDO: Desestructuramos para usarlo
  loading,
  error,
  onRefresh,
  onEdit,
}: EventListProps) => {
  const token = localStorage.getItem('accessToken')

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este evento?'))
      return

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
        alert('Error al eliminar el evento.')
      }
    } catch (err) {
      console.error('Error en la petición DELETE:', err)
    }
  }

  if (loading)
    return <p className="text-center font-bold p-10">Cargando eventos...</p>
  if (error) return <p className="text-red-500 text-center p-10">{error}</p>

  return (
    <div className="grid gap-4">
      {events.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No hay eventos próximos en Valencia. ¡Crea el primero!
        </p>
      ) : (
        events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            neighborhoods={neighborhoods} // 👈 PASADO: Ahora la card tiene acceso a los nombres
            onDelete={() => handleDelete(event.id)}
            onEdit={() => onEdit(event)}
          />
        ))
      )}
    </div>
  )
}
