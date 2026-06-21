import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, AlignLeft, MapPin, Save, Send, Info } from 'lucide-react'
import { MapComponent } from '../pages/MapComponent'
import api from '../services/api'

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
      try {
        const response = await api.get('/neighborhoods')
        const list = response.data.content || response.data || []
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
    try {
      const payload = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        eventDate: new Date(formData.eventDate).toISOString(),
        neighborhoodId: Number(formData.neighborhoodId),
      }

      if (eventToEdit) {
        await api.put(`/events/${eventToEdit.id}`, payload)
      } else {
        await api.post('/events', payload)
      }
      onSuccess()
    } catch (err) {
      console.error('Error en la petición:', err)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[75vh] overflow-y-auto px-4 custom-scrollbar"
    >
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 text-[#F28749]">
          <Info className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {eventToEdit
              ? t('events.form.editTag', 'Editant esdeveniment')
              : t('events.form.createTag', 'Nova trobada')}
          </span>
        </div>
        <h2 className="text-3xl font-black text-[#2D2D2D] uppercase tracking-tight">
          {eventToEdit
            ? t('events.form.editTitle')
            : t('events.form.createTitle')}
        </h2>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <AlignLeft className="w-3 h-3" /> {t('events.form.nameLabel')}
        </label>
        <input
          className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-[#F28749]/20 outline-none transition-all"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder={t('events.form.placeholderName')}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <Calendar className="w-3 h-3" /> {t('events.form.dateLabel')}
          </label>
          <input
            type="datetime-local"
            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:bg-white outline-none"
            value={formData.eventDate}
            onChange={e =>
              setFormData({ ...formData, eventDate: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <MapPin className="w-3 h-3" /> {t('events.form.neighborhoodLabel')}
          </label>
          <select
            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:bg-white outline-none cursor-pointer"
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

      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
          {t('events.form.locationLabel', 'Ubicació exacta (fes clic)')}
        </label>
        <div className="h-48 w-full rounded-[2rem] overflow-hidden border-2 border-gray-50 shadow-inner relative group">
          <MapComponent
            events={[]}
            onLocationSelect={handleMapLocationSelect}
            selectedPosition={{
              lat: formData.latitude,
              lng: formData.longitude,
            }}
          />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-white pointer-events-none">
            <span className="text-[9px] font-mono font-bold text-[#F28749]">
              {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
          {t('events.form.descriptionLabel')}
        </label>
        <textarea
          className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:bg-white outline-none h-28 resize-none transition-all"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder={t('events.form.placeholderDescription')}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#F28749] text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_25px_rgba(242,135,73,0.3)] flex items-center justify-center gap-3"
      >
        {eventToEdit ? (
          <Save className="w-4 h-4" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {eventToEdit
          ? t('events.form.saveButton')
          : t('events.form.submitButton')}
      </button>
    </form>
  )
}
