import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapComponent } from '../pages/MapComponent'
import { MapPin, Calendar, Type, AlignLeft, Save, Send } from 'lucide-react'

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
  const { t } = useTranslation()
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
        const response = await fetch(
          'http://localhost:8080/api/neighborhoods',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
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
        console.error('Error:', err)
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

  const handleNeighborhoodChange = (id: number) => {
    const selectedNB = neighborhoods.find(n => n.id === id)
    if (selectedNB) {
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

  const handleMapLocationSelect = (latlng: { lat: number; lng: number }) => {
    let closestName = ''
    let minDistance = Infinity

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

    const dbMatch = neighborhoods.find(
      n => n.name.toLowerCase().trim() === closestName.toLowerCase().trim(),
    )

    setFormData(prev => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
      neighborhoodId: dbMatch ? dbMatch.id : prev.neighborhoodId,
    }))
  }

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
          eventDate: new Date(formData.eventDate).toISOString(),
          neighborhoodId: Number(formData.neighborhoodId),
        }),
      })

      if (response.ok) onSuccess()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto px-2 custom-scrollbar"
    >
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-4 border-b border-gray-100">
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">
          {eventToEdit ? t('edit') : t('events')}
        </h2>
        <span className="flex items-center gap-1 bg-brand-orange/10 text-brand-orange text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-brand-orange/20">
          <MapPin className="w-3 h-3" />
          {neighborhoods.find(n => n.id === formData.neighborhoodId)?.name ||
            'Valencia'}
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Type className="w-3 h-3 text-brand-orange" />{' '}
            {t('nameLabel')}
          </label>
          <input
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-2xl outline-none transition-all font-bold"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Clean Park Day..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-brand-orange" />{' '}
              {t('events')}
            </label>
            <input
              type="datetime-local"
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-2xl outline-none transition-all font-bold"
              value={formData.eventDate}
              onChange={e =>
                setFormData({ ...formData, eventDate: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-brand-orange" />{' '}
              {t('neighborhoodLabel')}
            </label>
            <select
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-2xl outline-none transition-all font-bold appearance-none cursor-pointer"
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
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
            {t('neighborhoodPlaceholder')}
          </label>
          <div className="h-72 w-full rounded-[2.5rem] overflow-hidden border-4 border-gray-50 shadow-inner group">
            <MapComponent
              events={[]}
              onLocationSelect={handleMapLocationSelect}
              selectedPosition={{
                lat: formData.latitude,
                lng: formData.longitude,
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <AlignLeft className="w-3 h-3 text-brand-orange" />{' '}
            {t('descriptionLabel')}
          </label>
          <textarea
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-2xl h-32 outline-none transition-all font-medium resize-none"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder={t('descriptionPlaceholder')}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-brand-dark text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-orange transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
      >
        {eventToEdit ? (
          <Save className="w-4 h-4" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {eventToEdit
          ? t('save')
          : t('submitButton')}
      </button>
    </form>
  )
}
