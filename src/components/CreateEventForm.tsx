import { useState, useEffect } from 'react'

// Diccionario de coordenadas para los barrios de Valencia
// He incluido los IDs más comunes, ajusta los IDs según tu base de datos
const NEIGHBORHOOD_LOCATIONS: Record<number, { lat: number; lng: number }> = {
  1: { lat: 39.4699, lng: -0.3763 }, // Centro / Ciutat Vella
  2: { lat: 39.475, lng: -0.413 }, // Mislata
  3: { lat: 39.4615, lng: -0.36 }, // Ruzafa
  4: { lat: 39.485, lng: -0.345 }, // Benimaclet
  5: { lat: 39.47, lng: -0.33 }, // El Cabañal
  6: { lat: 39.455, lng: -0.385 }, // Patraix
  7: { lat: 39.48, lng: -0.37 }, // La Saïdia
  8: { lat: 39.472, lng: -0.395 }, // Campanar
}

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
    title: '',
    description: '',
    eventDate: '',
    latitude: 39.4699,
    longitude: -0.3763,
    neighborhoodId: 1,
  })

  // 1. Cargar barrios al montar el componente
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

        // Si no editamos y hay lista, inicializamos con el primer barrio y su coordenada
        if (!eventToEdit && list.length > 0) {
          const firstId = list[0].id
          const coords =
            NEIGHBORHOOD_LOCATIONS[firstId] || NEIGHBORHOOD_LOCATIONS[1]
          setFormData(prev => ({
            ...prev,
            neighborhoodId: firstId,
            latitude: coords.lat,
            longitude: coords.lng,
          }))
        }
      } catch (err) {
        console.error('Error cargando barrios:', err)
      }
    }
    fetchNeighborhoods()
  }, []) // Solo al montar

  // 2. Efecto para rellenar datos cuando entra en modo EDICIÓN
  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title,
        description: eventToEdit.description,
        eventDate: eventToEdit.eventDate.substring(0, 16),
        latitude: eventToEdit.latitude,
        longitude: eventToEdit.longitude,
        neighborhoodId: eventToEdit.neighborhoodId,
      })
    }
  }, [eventToEdit])

  // 3. Función para cambiar barrio y coordenadas SIMULTÁNEAMENTE
  const handleNeighborhoodChange = (id: number) => {
    const coords = NEIGHBORHOOD_LOCATIONS[id] || NEIGHBORHOOD_LOCATIONS[1]
    setFormData({
      ...formData,
      neighborhoodId: id,
      latitude: coords.lat,
      longitude: coords.lng,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('accessToken')

    const url = eventToEdit
      ? `http://localhost:8080/api/events/${eventToEdit.id}`
      : 'http://localhost:8080/api/events'

    const method = eventToEdit ? 'PUT' : 'POST'

    const payload = {
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
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
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Yoga en el parque"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-500">Descripción</label>
        <textarea
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-coral outline-none h-24"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Cuéntanos más sobre el evento..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-500">Fecha</label>
          <input
            type="datetime-local"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
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
            className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-brand-coral outline-none cursor-pointer"
            value={formData.neighborhoodId}
            onChange={e => handleNeighborhoodChange(Number(e.target.value))}
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

      {/* Inputs invisibles para asegurar que lat/lng viajan en el payload */}
      <input type="hidden" value={formData.latitude} />
      <input type="hidden" value={formData.longitude} />

      <button
        type="submit"
        className="w-full bg-brand-coral text-white p-4 rounded-xl font-bold hover:bg-brand-orange transition-all mt-4 shadow-lg shadow-brand-coral/20"
      >
        {eventToEdit ? '💾 Guardar Cambios' : '🚀 Publicar Evento'}
      </button>
    </form>
  )
}
