import { useState, useEffect } from 'react'

export const CreateEventForm = ({
  onSuccess,
  eventToEdit,
}: {
  onSuccess: () => void
  eventToEdit?: any
}) => {
  const [neighborhoods, setNeighborhoods] = useState<
    { id: number; name: string }[]
  >([])

  const [formData, setFormData] = useState({
    title: eventToEdit?.title || '',
    description: eventToEdit?.description || '',
    // Formateamos la fecha para el input datetime-local (YYYY-MM-DDTHH:mm)
    eventDate: eventToEdit?.eventDate
      ? eventToEdit.eventDate.substring(0, 16)
      : '',
    latitude: eventToEdit?.latitude || 39.4699,
    longitude: eventToEdit?.longitude || 0.3763,
    neighborhoodId: eventToEdit?.neighborhoodId || 1,
  })

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      const token = localStorage.getItem('accessToken')
      try {
        const response = await fetch(
          'http://localhost:8080/api/neighborhoods',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        const data = await response.json()
        const list = data.content || []
        setNeighborhoods(list)

        // Si no estamos editando, ponemos el primer barrio por defecto
        if (!eventToEdit && list.length > 0) {
          setFormData(prev => ({ ...prev, neighborhoodId: list[0].id }))
        }
      } catch (err) {
        console.error('Error cargando barrios:', err)
      }
    }
    fetchNeighborhoods()
  }, [eventToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('accessToken')

    // Decidimos URL y Método según si editamos o creamos
    const url = eventToEdit
      ? `http://localhost:8080/api/events/${eventToEdit.id}`
      : 'http://localhost:8080/api/events'

    const method = eventToEdit ? 'PUT' : 'POST'

    const payload = {
      ...formData,
      eventDate: new Date(formData.eventDate).toISOString(),
      neighborhoodId: Number(formData.neighborhoodId),
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        console.error('Error del servidor:', errorData)
      }
    } catch (err) {
      console.error('Error procesando evento:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-black text-brand-dark">
        {eventToEdit ? 'Editar Evento' : 'Crear Nuevo Evento'}
      </h2>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-500">Título</label>
        <input
          className="w-full p-3 border rounded-xl"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-500">Descripción</label>
        <textarea
          className="w-full p-3 border rounded-xl"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-500">Fecha</label>
          <input
            type="datetime-local"
            className="w-full p-3 border rounded-xl"
            value={formData.eventDate}
            onChange={e =>
              setFormData({ ...formData, eventDate: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-500">Barrio</label>
          <select
            className="w-full p-3 border rounded-xl bg-white"
            value={formData.neighborhoodId}
            onChange={e =>
              setFormData({
                ...formData,
                neighborhoodId: Number(e.target.value),
              })
            }
            required
          >
            {neighborhoods.map(n => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-brand-coral text-white p-4 rounded-xl font-bold hover:bg-brand-orange transition-all mt-4"
      >
        {eventToEdit ? 'Guardar Cambios' : 'Publicar Evento'}
      </button>
    </form>
  )
}
