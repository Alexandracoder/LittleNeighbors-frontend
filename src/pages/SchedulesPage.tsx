import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom' // Importamos useParams
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react'
import playdateService from '../services/playdateService'
import dashboardBg from '../assets/new-at-neigborhood.png'
import { Playdate } from '../types'

const SchedulesPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>() // Capturamos el ID de la URL
  const navigate = useNavigate()

  const [playdates, setPlaydates] = useState<Playdate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Si no hay matchId en la URL, algo salió mal, volvemos
    if (!matchId) {
      navigate('/messages')
      return
    }

const fetchPlaydates = async () => {
  try {
    // 1. Llamamos al servicio
    const response = await playdateService.getByMatch(Number(matchId))

    // 2. Imprime para estar 100% seguro de qué llega
    console.log('Respuesta del servicio:', response)

    // 3. Como el error dice que 'response' es 'Playdate[]',
    // lo asignamos directamente sin buscar '.data'
    if (Array.isArray(response)) {
      setPlaydates(response)
    } else {
      // Por si acaso el servicio devolviera null o algo inesperado
      setPlaydates([])
    }
  } catch (error) {
    console.error('Error fetching playdates:', error)
  } finally {
    setLoading(false)
  }
}

    fetchPlaydates()
  }, [matchId, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-white font-black uppercase tracking-widest animate-pulse">
          Loading Schedules...
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full p-6 text-white font-sans flex flex-col">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10 bg-gradient-to-br from-black/40 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-20 max-w-2xl mx-auto w-full flex flex-grow flex-col">
        <button
          onClick={() => navigate(-1)}
          className="bg-white text-gray-800 mb-8 flex w-fit items-center gap-2 rounded-full px-5 py-2.5 font-black uppercase tracking-widest text-[10px] shadow-lg border border-white transition-all hover:scale-105"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Chat
        </button>

        <h1 className="text-5xl font-black uppercase text-white mb-10 italic tracking-tighter drop-shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
          My <span className="text-[#F28749]">Playdates</span>
        </h1>

        {playdates.length > 0 ? (
          <div className="space-y-4">
            {playdates.map(pd => {
              const dateObj = new Date(pd.startTime)
              const day = dateObj.getDate()
              const month = dateObj.toLocaleString('en-US', { month: 'short' })
              const time = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })

              return (
                <div
                  key={pd.id}
                  className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-6 shadow-2xl border border-white flex items-center justify-between group hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#F28749] rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-lg shadow-orange-200">
                      <span className="text-[10px] font-black uppercase leading-none">
                        {month}
                      </span>
                      <span className="text-2xl font-black leading-tight">
                        {day}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-gray-900 font-black uppercase text-base leading-tight">
                        {pd.title}
                      </h3>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                          <MapPin size={12} className="text-[#F28749]" />
                          {pd.status === 'ACCEPTED'
                            ? 'Confirmed Location'
                            : 'Proposed'}
                        </p>
                        <p className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                          <Clock size={12} /> {time}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      pd.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {pd.status}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            onClick={() => navigate('/add-playdate', { state: { matchId } })}
            className="group flex items-center gap-5 px-10 py-8 bg-white/95 backdrop-blur-sm rounded-[3rem] shadow-2xl cursor-pointer border border-white transition-all active:scale-95"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-inner group-hover:bg-orange-50 transition-colors">
              <Calendar className="w-7 h-7 text-[#F28749]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">
                No Playdates Yet
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none mt-1 group-hover:text-[#F28749] transition-colors">
                Tap to suggest the first one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SchedulesPage
