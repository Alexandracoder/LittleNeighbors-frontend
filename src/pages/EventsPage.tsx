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
import api, { familyApi } from '../services/api'

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
  const [myFamilyId, setMyFamilyId] = useState<number | null>(null)
  const [citywide, setCitywide] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchEvents(), fetchNeighborhoods(), fetchMyFamilyId()])
      } catch (err) {
        console.error('Error inicializando datos de la página:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    // Se salta el primer render (ya lo carga loadData de arriba) y solo
    // refresca cuando la persona cambia el toggle manualmente.
    if (loading) return
    fetchEvents(citywide)
  }, [citywide])

  const fetchMyFamilyId = async () => {
    try {
      const family = await familyApi.getMyFamily()
      setMyFamilyId(family?.id ?? null)
    } catch (err) {
      console.error('Error cargando mi familia:', err)
    }
  }

  const handleHide = async (eventId: number) => {
    try {
      await api.post(`/events/${eventId}/hide`)
      setEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (err) {
      console.error('Error ocultando evento:', err)
    }
  }

  const handleAttendChange = (eventId: number, isAttending: boolean) => {
    setEvents(prev =>
      prev.map(e => {
        if (e.id !== eventId) return e
        const currentCount = e.attendeeCount ?? 0
        return {
          ...e,
          isAttending,
          attendeeCount: isAttending
            ? currentCount + 1
            : Math.max(0, currentCount - 1),
        }
      }),
    )
  }

  const fetchNeighborhoods = async () => {
    try {
      const res = await api.get('/neighborhoods')
      setNeighborhoods(res.data.content || [])
    } catch (err) {
      console.error('Error cargando barrios:', err)
    }
  }

  const fetchEvents = async (citywideOverride?: boolean) => {
    try {
      const res = await api.get('/events/map', {
        params: {
          minLat: -90,
          maxLat: 90,
          minLon: -180,
          maxLon: 180,
          citywide: citywideOverride ?? citywide,
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
        {/* NAVEGACIÓN Y TOGGLE DE MAPA */}
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
              onClick={() => setIsMapVisible(!isMapVisible)}
              className="text-white text-[11px] font-black uppercase tracking-[0.2em] hover:text-[#F28749] transition-colors underline decoration-2 underline-offset-8"
            >
              {isMapVisible
                ? t('events.page.toggleMapHide')
                : t('events.page.toggleMapShow')}
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

        {/* TOGGLE BARRIO / TODA LA CIUDAD */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-lg w-fit">
          <button
            onClick={() => setCitywide(false)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              !citywide
                ? 'bg-[#F28749] text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {t('events.page.scopeNeighborhood', 'Mi barrio')}
          </button>
          <button
            onClick={() => setCitywide(true)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              citywide
                ? 'bg-[#F28749] text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {t('events.page.scopeCity', 'Toda la ciudad')}
          </button>
        </div>

        {isMapVisible && (
          <div className="h-[400px] w-full relative overflow-hidden rounded-[3rem] border-4 border-white/30 shadow-2xl transition-all animate-in fade-in zoom-in duration-500 mb-8">
            <MapComponent
              key={events.length + (events[0]?.id || 0)}
              events={events}
            />
          </div>
        )}

        {/* LISTADO DE EVENTOS O EMPTY STATE COMPACTO */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-2xl min-h-[180px] flex flex-col justify-center">
          {!loading && events.length === 0 ? (
            <div className="flex items-center gap-6 py-4 px-4 animate-in fade-in slide-in-from-left-4 duration-700">
              <button
                onClick={() => {
                  setEventToEdit(null)
                  setIsModalOpen(true)
                }}
                className="bg-white/20 p-4 rounded-2xl border border-white/30 shadow-inner flex-shrink-0 hover:bg-[#F28749] hover:scale-110 transition-all group"
                title={t('events.page.createButton')}
              >
                <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform" />
              </button>

              <div className="text-left cursor-default">
                <h3 className="text-white text-lg font-black uppercase tracking-tight">
                  {t('events.page.noEventsTitle')}
                </h3>
                <p className="text-white/70 text-xs font-medium max-w-[250px] leading-relaxed">
                  {t('events.page.noEventsSubtitle')}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setEventToEdit(null)
                    setIsModalOpen(true)
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F28749] text-white rounded-full shadow-lg hover:scale-105 hover:brightness-110 active:scale-95 transition-all"
                  title={t('events.page.createButton')}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t('events.page.createButton', 'Crear evento')}
                  </span>
                </button>
              </div>
              <EventList
                events={events}
                neighborhoods={neighborhoods}
                loading={loading}
                error={error}
                onRefresh={fetchEvents}
                onEdit={handleEditClick}
                onHide={handleHide}
                onAttendChange={handleAttendChange}
                myFamilyId={myFamilyId}
              />
            </>
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
