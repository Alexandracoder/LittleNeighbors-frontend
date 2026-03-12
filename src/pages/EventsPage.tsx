import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import dashboardBg from '../assets/parent-meeting.png'
import { EventList } from '../components/EventList'
import { EventMap } from '../components/EventMap'
import { EventModal } from '../components/EventModal'
import { CreateEventForm } from '../components/CreateEventForm'

export default function EventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMapVisible, setIsMapVisible] = useState(false) // Estado para el toggle

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = () => {
    const token = localStorage.getItem('accessToken')
    fetch(
      'http://localhost:8080/api/events/map?minLat=-90&maxLat=90&minLon=-180&maxLon=180',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar eventos')
        return res.json()
      })
      .then(data => {
        setEvents(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('No pudimos cargar los eventos.')
        setLoading(false)
      })
  }

  return (
    <div className="relative min-h-screen w-full p-6 text-brand-dark font-sans">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10 bg-white/40 pointer-events-none" />

      {/* Botón flotante para abrir el modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-brand-coral text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 font-bold"
      >
        <Plus className="w-6 h-6" /> Crear Evento
      </button>

      {/* Modal de Creación */}
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateEventForm
          onSuccess={() => {
            setIsModalOpen(false)
            fetchEvents()
          }}
        />
      </EventModal>

      <div className="relative z-20 max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-dark hover:text-brand-coral transition-colors font-bold"
        >
          <ArrowLeft className="w-6 h-6" /> Back to Dashboard
        </button>

        <h1 className="text-5xl font-black uppercase text-brand-dark drop-shadow-sm">
          Neighborhood Events
        </h1>

        {/* Trigger del Mapa */}
        <button
          onClick={() => setIsMapVisible(!isMapVisible)}
          className="text-brand-dark font-bold underline hover:text-brand-coral transition-colors"
        >
          {isMapVisible ? 'Ocultar mapa' : 'Ver eventos en el mapa'}
        </button>

        {/* Mapa Condicional - Solo se renderiza si isMapVisible es true */}
        {isMapVisible && (
          <div className="h-[300px] w-full overflow-hidden rounded-[2rem] border border-white/50 shadow-2xl transition-all duration-300">
            <EventMap events={events} />
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 shadow-xl">
          <EventList events={events} loading={loading} error={error} />
        </div>
      </div>
    </div>
  )
}
