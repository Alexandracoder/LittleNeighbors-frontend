import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutDashboard, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import dashboardBg from '../assets/parent-meeting.png'
import { EventList } from '../components/EventList'
import { EventModal } from '../components/EventModal'
import { CreateEventForm } from '../components/CreateEventForm'
import { MapComponent } from './MapComponent'
import MainLayout from '../components/layout/MainLayout'
import api from '../services/api'

export default function EventsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [events, setEvents] = useState<any[]>([])
  const [neighborhoods, setNeighborhoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [eventToEdit, setEventToEdit] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchEvents(), fetchNeighborhoods()])
      } catch (err) {
        console.error('Error inicializando datos de la página:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const fetchNeighborhoods = async () => {
    try {
      const res = await api.get('/neighborhoods')
      setNeighborhoods(res.data.content || [])
    } catch (err) {
      console.error('Error cargando barrios:', err)
    }
  }

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/map', {
        params: {
          minLat: -90,
          maxLat: 90,
          minLon: -180,
          maxLon: 180,
        },
      })
      setEvents(res.data)
    } catch (err) {
      console.error('Error de Axios al cargar eventos:', err)
      setError(t('events.card.errorLoad'))
    }
  }

  const handleEditClick = (event: any) => {
    setEventToEdit(event)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEventToEdit(null)
  }

  return (
    <MainLayout
      backgroundImage={dashboardBg}
      title={t('events.page.title')}
      subtitle={t('events.page.subtitle')}
      showGlassCard={false}
    >
      <div className="flex flex-col gap-8">
        {/* NAVEGACIÓN Y ACCIONES */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all group shadow-lg w-fit"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t('common.back')}
            </span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setEventToEdit(null)
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 bg-[#F28749] text-white px-5 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              {t('events.page.createButton', 'Nou esdeveniment')}
            </button>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-lg">
              <button
                onClick={() => setIsMapVisible(!isMapVisible)}
                className={`p-2.5 rounded-full text-white transition-all hover:scale-110 ${
                  isMapVisible ? 'bg-[#F28749]' : 'hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isMapVisible && (
          <div className="h-[400px] w-full relative overflow-hidden rounded-[3rem] border-4 border-white/30 shadow-2xl transition-all animate-in fade-in zoom-in duration-500 mb-8">
            <MapComponent
              key={events.length + (events[0]?.id || 0)}
              events={events}
            />
          </div>
        )}

        {/* LISTADO DE EVENTOS */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-2xl min-h-[180px]">
          {!loading && events.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-white text-lg font-black uppercase">
                {t('events.page.noEventsTitle')}
              </h3>
              <p className="text-white/70 text-xs">
                {t('events.page.noEventsSubtitle')}
              </p>
            </div>
          ) : (
            <EventList
              events={events}
              neighborhoods={neighborhoods}
              loading={loading}
              error={error}
              onRefresh={fetchEvents}
              onEdit={handleEditClick}
            />
          )}
        </div>

        <EventModal isOpen={isModalOpen} onClose={handleCloseModal}>
          <CreateEventForm
            eventToEdit={eventToEdit}
            onSuccess={() => {
              handleCloseModal()
              fetchEvents()
            }}
          />
        </EventModal>
      </div>
    </MainLayout>
  )
}
