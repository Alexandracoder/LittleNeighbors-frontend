import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Map as MapIcon, List as ListIcon } from 'lucide-react'
import dashboardBg from '../assets/parent-meeting.png'
import { EventList } from '../components/EventList'
import { EventModal } from '../components/EventModal'
import { CreateEventForm } from '../components/CreateEventForm'
import { MapComponent } from './MapComponent'

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
    fetchEvents()
    fetchNeighborhoods()
  }, [])

  const fetchNeighborhoods = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const res = await fetch('http://localhost:8080/api/neighborhoods', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setNeighborhoods(data.content || [])
    } catch (err) {
      console.error('Error loading neighborhoods:', err)
    }
  }

  const fetchEvents = () => {
    const token = localStorage.getItem('accessToken')
    setLoading(true)
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
        if (!res.ok) throw new Error('Error loading events')
        return res.json()
      })
      .then(data => {
        setEvents(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(t('auth.login.error'))
        setLoading(false)
      })
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
    <div className="relative min-h-screen w-full p-6 text-brand-dark font-sans overflow-x-hidden">
      {/* Background with subtle overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10 bg-white/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEventToEdit(null)
          setIsModalOpen(true)
        }}
        className="fixed bottom-10 right-10 z-50 bg-brand-coral text-white px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(255,111,97,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black uppercase tracking-widest text-xs"
      >
        <Plus className="w-5 h-5" /> {t('onboarding.addChild.submitButton')}
      </button>

      {/* Modal for Creating/Editing */}
      <EventModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-2">
          <CreateEventForm
            eventToEdit={eventToEdit}
            onSuccess={() => {
              handleCloseModal()
              fetchEvents()
            }}
          />
        </div>
      </EventModal>

      <div className="relative z-20 max-w-5xl mx-auto space-y-10 pb-24">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-brand-dark/60 hover:text-brand-dark transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('back')}
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-6xl font-black uppercase text-brand-dark tracking-tighter leading-none">
              {t('events')}
            </h1>
            <div className="h-2 w-20 bg-brand-orange mt-4 rounded-full" />
          </div>

          <button
            onClick={() => setIsMapVisible(!isMapVisible)}
            className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-brand-dark/5 font-black uppercase tracking-widest text-[10px] hover:bg-brand-dark hover:text-white transition-all"
          >
            {isMapVisible ? (
              <>
                <ListIcon className="w-4 h-4" /> {t('edit')}
              </>
            ) : (
              <>
                <MapIcon className="w-4 h-4" />{' '}
                {t('see On Map')}
              </>
            )}
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="space-y-8">
          {isMapVisible && (
            <div className="h-[500px] w-full relative overflow-hidden rounded-[3rem] border-8 border-white shadow-2xl animate-in zoom-in duration-500">
              <MapComponent
                key={events.length + (events[0]?.id || 0)}
                events={events}
              />
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] border border-white shadow-2xl">
            <EventList
              events={events}
              neighborhoods={neighborhoods}
              loading={loading}
              error={error}
              onRefresh={fetchEvents}
              onEdit={handleEditClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
