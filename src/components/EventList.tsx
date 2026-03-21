// EventList.tsx

import { EventCard } from "./EventCard"

interface EventListProps {
  events: any[]
  loading: boolean
  error: string | null
  onRefresh: () => void // Añadimos esto para recargar tras borrar
}

export const EventList = ({
  events,
  loading,
  error,
  onRefresh,
}: EventListProps) => {
  const token = localStorage.getItem('accessToken')

  // 1. Lógica Real de Borrado
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
        // Notificamos al padre (EventsPage) que los datos han cambiado
        onRefresh()
      } else {
        const errorData = await response.json()
        alert(`Error al eliminar: ${errorData.message || 'No autorizado'}`)
      }
    } catch (err) {
      console.error('Error en la petición DELETE:', err)
      alert('Error de conexión con el servidor.')
    }
  }

  // 2. Lógica de Edición (Redirección o Apertura de Modal)
  const handleOpenEdit = (event: any) => {
    // Si tienes una ruta de edición, redirigimos:
    // navigate(`/events/edit/${event.id}`);

    // O si prefieres manejarlo con el modal que ya tienes:
    console.log('Editando evento:', event)
    // Aquí podrías setear un estado 'eventToEdit' y abrir el modal
  }

  if (loading)
    return <p className="text-center font-bold">Cargando eventos...</p>
  if (error) return <p className="text-red-500 text-center">{error}</p>

  return (
    <div className="grid gap-4">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onDelete={() => handleDelete(event.id)} // Pasamos la función real
          onEdit={() => handleOpenEdit(event)} // Pasamos la función real
        />
      ))}
    </div>
  )
}
