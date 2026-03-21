import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import dashboardBg from '../assets/parent-meeting.png'
import { EventList } from '../components/EventList'
import { EventModal } from '../components/EventModal'
import { CreateEventForm } from '../components/CreateEventForm'
import { MapComponent } from './Map.Component'

export default function EventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<any[]>([]) // Tipamos como array de cualquier cosa para evitar 'never'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMapVisible, setIsMapVisible] = useState(false)

  // --- NUEVO ESTADO PARA LA EDICIÓN ---
  const [eventToEdit, setEventToEdit] = useState<any>(null)

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

  // --- FUNCIÓN PARA ABRIR EL MODAL EN MODO EDICIÓN ---
  const handleEditClick = (event: any) => {
    setEventToEdit(event)
    setIsModalOpen(true)
  }

  // --- FUNCIÓN PARA CERRAR Y LIMPIAR EL ESTADO ---
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEventToEdit(null) // Importante limpiar para que el próximo "Crear" no sea "Editar"
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

      {/* Botón Crear */}
      <button
        onClick={() => {
          setEventToEdit(null) // Aseguramos que es creación pura
          setIsModalOpen(true)
        }}
        className="fixed bottom-8 right-8 z-40 bg-brand-coral text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 font-bold"
      >
        <Plus className="w-6 h-6" /> Crear Evento
      </button>

      {/* Modal - Ahora pasamos el evento a editar si existe */}
      <EventModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <CreateEventForm
          eventToEdit={eventToEdit}
          onSuccess={() => {
            handleCloseModal()
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

        <button
          onClick={() => setIsMapVisible(!isMapVisible)}
          className="text-brand-dark font-bold underline hover:text-brand-coral transition-colors"
        >
          {isMapVisible ? 'Ocultar mapa' : 'Ver eventos en el mapa'}
        </button>

        {isMapVisible && (
          <div className="h-[400px] w-full relative overflow-hidden rounded-[2rem] border-4 border-white shadow-2xl transition-all">
            {/* El key fuerza el refresco del mapa cuando cambian los eventos */}
            <MapComponent
              key={events.length + (events[0]?.id || 0)}
              events={events}
            />
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 shadow-xl">
          <EventList
            events={events}
            loading={loading}
            error={error}
            onRefresh={fetchEvents}
            onEdit={handleEditClick} // <--- PASAMOS LA FUNCIÓN DE EDICIÓN
          />
        </div>
      </div>
    </div>
  )
}
