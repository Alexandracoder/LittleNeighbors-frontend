import { useState, useEffect } from 'react'
// Ajustamos la ruta: subimos un nivel y entramos en pages
import { MapComponent } from '../pages/MapComponent'

const NEIGHBORHOOD_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Ciutat Vella': { lat: 39.475, lng: -0.375 },
  Ruzafa: { lat: 39.462, lng: -0.372 },
  Benimaclet: { lat: 39.485, lng: -0.348 },
  'El Carmen': { lat: 39.479, lng: -0.378 },
  Patraix: { lat: 39.458, lng: -0.395 },
  Cabanyal: { lat: 39.468, lng: -0.328 },
  Campanar: { lat: 39.482, lng: -0.398 },
  Eixample: { lat: 39.465, lng: -0.37 },
  Extramurs: { lat: 39.47, lng: -0.385 },
  'La Saidia': { lat: 39.488, lng: -0.375 },
  'L Olivereta': { lat: 39.471, lng: -0.398 },
  Mislata: { lat: 39.475, lng: -0.418 },
  'El Pla del Real': { lat: 39.478, lng: -0.358 },
  Algiros: { lat: 39.475, lng: -0.34 },
  Benicalap: { lat: 39.495, lng: -0.39 },
  'Quatre Carreres': { lat: 39.45, lng: -0.36 },
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

useEffect(() => {
  const fetchNeighborhoods = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const response = await fetch('http://localhost:8080/api/neighborhoods', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      const list = data.content || []
      setNeighborhoods(list)

      if (!eventToEdit && list.length > 0) {
        const firstNB = list[0]
        const coords = NEIGHBORHOOD_LOCATIONS[firstNB.name] || {
          lat: 39.4699,
          lng: -0.3763,
        }

        setFormData(prev => ({
          ...prev,
          neighborhoodId: firstNB.id,
          latitude: coords.lat,
          longitude: coords.lng,
        }))
      }
    } catch (err) {
      console.error('Error cargando barrios:', err)
    }
  }
  fetchNeighborhoods()
}, [eventToEdit])

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

  // 1. Cuando el usuario cambia el Select manualmente
  const handleNeighborhoodChange = (id: number) => {
    // Buscamos el objeto del barrio en la lista de la DB para obtener su nombre
    const selectedNB = neighborhoods.find(n => n.id === id)

    if (selectedNB) {
      // Buscamos las coordenadas en nuestro diccionario usando el NOMBRE como llave
      // Usamos coordenadas por defecto (Centro de Valencia) si el nombre no existe en el dict
      const coords = NEIGHBORHOOD_LOCATIONS[selectedNB.name] || {
        lat: 39.4699,
        lng: -0.3763,
      }

      setFormData({
        ...formData,
        neighborhoodId: id,
        latitude: coords.lat,
        longitude: coords.lng,
      })
    }
  }

  // 2. Cuando el usuario pincha en el mapa
  const handleMapLocationSelect = (latlng: { lat: number; lng: number }) => {
    let closestName = ''
    let minDistance = Infinity

    // Buscamos el NOMBRE del barrio más cercano recorriendo NEIGHBORHOOD_LOCATIONS
    Object.entries(NEIGHBORHOOD_LOCATIONS).forEach(([name, coords]) => {
      const dist = Math.sqrt(
        Math.pow(latlng.lat - coords.lat, 2) +
          Math.pow(latlng.lng - coords.lng, 2),
      )
      if (dist < minDistance) {
        minDistance = dist
        closestName = name
      }
    })

    // Ahora buscamos el ID real en la lista de la DB que coincida con ese nombre
    const dbMatch = neighborhoods.find(
      n => n.name.toLowerCase().trim() === closestName.toLowerCase().trim(),
    )

    setFormData(prev => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
      // Si hay coincidencia, actualizamos el ID; si no, mantenemos el anterior
      neighborhoodId: dbMatch ? dbMatch.id : prev.neighborhoodId,
    }))
  }

  // 3. Envío del formulario (limpio y con tipado correcto)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('accessToken')
    const url = eventToEdit
      ? `http://localhost:8080/api/events/${eventToEdit.id}`
      : 'http://localhost:8080/api/events'
    const method = eventToEdit ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          // Convertimos la fecha local del input a ISO para Spring Boot
          eventDate: new Date(formData.eventDate).toISOString(),
          neighborhoodId: Number(formData.neighborhoodId),
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        console.error('Error del servidor:', errorData)
      }
    } catch (err) {
      console.error('Error en la petición:', err)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[80vh] overflow-y-auto px-2"
    >
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-2">
        <h2 className="text-xl font-black text-brand-dark">
          {eventToEdit ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h2>
        <span className="bg-brand-coral/10 text-brand-coral text-[10px] px-3 py-1 rounded-full font-black uppercase border border-brand-coral/20">
          📍{' '}
          {neighborhoods.find(n => n.id === formData.neighborhoodId)?.name ||
            'Valencia'}
        </span>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-500">Título</label>
        <input
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
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
            className="w-full p-3 border rounded-xl bg-white cursor-pointer outline-none font-bold"
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

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-500 block">
          Ubicación exacta (haz clic):
        </label>
        <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-brand-coral/20 shadow-inner">
          <MapComponent
            events={[]}
            onLocationSelect={handleMapLocationSelect}
            selectedPosition={{
              lat: formData.latitude,
              lng: formData.longitude,
            }}
          />
        </div>
        <div className="text-[10px] text-center font-mono text-gray-400">
          {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-500">Descripción</label>
        <textarea
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-coral outline-none h-24"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-brand-coral text-white p-4 rounded-xl font-bold hover:bg-brand-orange transition-all shadow-lg active:scale-95"
      >
        {eventToEdit ? '💾 Guardar Cambios' : '🚀 Publicar Evento'}
      </button>
    </form>
  )
}
