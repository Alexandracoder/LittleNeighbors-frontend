import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import playdateService from '../services/playdateService'
import dashboardBg from '../assets/new-at-neigborhood.png'
import { Playdate } from '../types'

const ENV_API_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const WS_BASE_URL = ENV_API_URL.replace('/api', '') 

const SchedulesPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()

  const [playdates, setPlaydates] = useState<Playdate[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const stompClient = useRef<Client | null>(null)


  const fetchPlaydates = useCallback(async () => {
    try {
      if (matchId) {
        const response = await playdateService.getByMatch(Number(matchId))
        setPlaydates(Array.isArray(response) ? response : [])
      } else {
        const response = await playdateService.getAllMyPlaydates()
        setPlaydates(Array.isArray(response) ? response : [])
      }
    } catch (error) {
      console.error('Error fetching playdates:', error)
    } finally {
      setLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    fetchPlaydates()
  }, [fetchPlaydates])


  useEffect(() => {
    if (!matchId) return


    const token = localStorage.getItem('accessToken') || ''

    const client = new Client({
      webSocketFactory: () =>
      
        new SockJS(`${WS_BASE_URL}/ws-little-neighbors`),
      connectHeaders: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
      onConnect: () => {
        client.subscribe(`/topic/playdates/${matchId}`, () => {
          fetchPlaydates()
        })
      },
      onStompError: frame => {
        console.error('Broker reported error: ' + frame.headers['message'])
        console.error('Additional details: ' + frame.body)
      },
    })

    client.activate()
    stompClient.current = client

    return () => {
      if (client.active) client.deactivate()
    }
  }, [matchId, fetchPlaydates])

  const handleConfirm = async (playdateId: number) => {
    setActionLoading(playdateId)
    try {
      await playdateService.confirm(playdateId)
      await fetchPlaydates()
    } catch (error) {
      console.error('Error confirming playdate:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleEmptyStateClick = () => {
    if (matchId) {
      navigate('/add-playdate', { state: { matchId } })
    } else {
      navigate('/explore')
    }
  }

  const formatDateInfo = (dateString: string) => {
    const dateObj = new Date(dateString)
    return {
      day: dateObj.getDate(),
      month: dateObj.toLocaleString(
        i18n.language === 'es' ? 'es-ES' : 'en-US',
        { month: 'short' },
      ),
      time: dateObj.toLocaleTimeString(
        i18n.language === 'es' ? 'es-ES' : 'en-US',
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-white font-black uppercase tracking-widest animate-pulse">
          {t('playdates.status.loadingAgenda', 'Cargando Agenda...')}
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
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-10 bg-gradient-to-br from-black/40 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-20 max-w-2xl mx-auto w-full flex flex-grow flex-col">
        {/* BOTONES DE NAVEGACIÓN SUPERIOR */}
        <div className="flex justify-between items-start mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-gray-800 flex items-center gap-2 rounded-full px-5 py-2.5 font-black uppercase tracking-widest text-[10px] shadow-lg border border-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-3 h-3" /> {t('common.back', 'Volver')}
          </button>

          {matchId && (
            <button
              onClick={() => navigate('/add-playdate', { state: { matchId } })}
              className="bg-[#F28749] text-white flex items-center gap-2 rounded-full px-5 py-2.5 font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 border border-[#F28749]"
            >
              <Plus className="w-3 h-3" />{' '}
              {t('playdates.form.proposeShort', 'Proponer')}
            </button>
          )}
        </div>

        {/* TÍTULO PRINCIPAL DE LA AGENDA */}
        <h1 className="text-5xl font-black uppercase text-white mb-10 italic tracking-tighter drop-shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
          {matchId
            ? t('playdates.page.agendaTitleMatch', 'Agenda de')
            : t('playdates.page.agendaTitle', 'Mis Citas de')}{' '}
          <span className="text-[#F28749]">
            {t('playdates.page.agendaHighlight', 'Juego')}
          </span>
        </h1>

        {/* LISTADO DE CITAS */}
        {playdates.length > 0 ? (
          <div className="space-y-4">
            {playdates.map(pd => {
              const { day, month, time } = formatDateInfo(pd.startTime)
              const isAccepted = pd.status === 'ACCEPTED'

              return (
                <div
                  key={pd.id}
                  className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-6 shadow-2xl border border-white transition-all overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      {/* BLOQUE DE FECHA ESTILO CALENDARIO */}
                      <div
                        className={`w-16 h-16 shrink-0 ${
                          isAccepted ? 'bg-green-500' : 'bg-[#F28749]'
                        } rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-lg transition-colors`}
                      >
                        <span className="text-[10px] font-black uppercase leading-none">
                          {month}
                        </span>
                        <span className="text-2xl font-black leading-tight">
                          {day}
                        </span>
                      </div>

                      {/* DETALLES DEL CONTENIDO */}
                      <div>
                        <h3 className="text-gray-900 font-black uppercase text-base leading-tight">
                          {pd.title}
                        </h3>
                        {!matchId && pd.matchId && (
                          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest my-0.5">
                            {t('playdates.card.matchRef', 'Vecino Ref')}: #
                            {pd.matchId}
                          </p>
                        )}
                        <div className="flex flex-col gap-1 mt-1">
                          <p className="flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                            <MapPin
                              size={12}
                              className={
                                isAccepted ? 'text-green-500' : 'text-[#F28749]'
                              }
                            />
                            {pd.location ||
                              (isAccepted
                                ? t(
                                    'playdates.status.confirmedLocation',
                                    'Ubicación Confirmada',
                                  )
                                : t(
                                    'playdates.status.proposedLocation',
                                    'Ubicación Propuesta',
                                  ))}
                          </p>
                          <p className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={12} /> {time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* BADGE DE ESTADO */}
                    <div
                      className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${
                        isAccepted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {isAccepted
                        ? t('playdates.status.accepted', 'ACEPTADO')
                        : t('playdates.status.pending', 'PENDIENTE')}
                    </div>
                  </div>

                  {/* ACCIÓN DE CONFIRMACIÓN */}
                  {!isAccepted ? (
                    <button
                      onClick={() => handleConfirm(pd.id)}
                      disabled={actionLoading === pd.id}
                      className="mt-6 w-full bg-[#F28749] hover:bg-[#e0763a] disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {actionLoading === pd.id
                        ? t('playdates.status.confirming', 'Confirmando...')
                        : t('playdates.form.confirmPlan', 'Confirmar Plan')}
                    </button>
                  ) : (
                    <div className="mt-6 w-full bg-green-50 border border-green-100 text-green-600 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} />
                      {t(
                        'playdates.status.planConfirmed',
                        '¡Plan Confirmado! 🚀',
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* EMPTY STATE INTELIGENTE */
          <div
            onClick={handleEmptyStateClick}
            className="group flex items-center gap-5 px-10 py-8 bg-white/95 backdrop-blur-sm rounded-[3rem] shadow-2xl cursor-pointer border border-white transition-all active:scale-95 hover:bg-white"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-inner group-hover:bg-orange-50 transition-colors">
              <Calendar className="w-7 h-7 text-[#F28749]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">
                {t('playdates.status.emptyAgenda', 'No hay citas planificadas')}
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none mt-1 group-hover:text-[#F28749] transition-colors">
                {matchId
                  ? t(
                      'playdates.status.tapToSuggest',
                      'Toca aquí para proponer un plan',
                    )
                  : t(
                      'playdates.status.exploreToSuggest',
                      'Explora familias para proponer',
                    )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SchedulesPage
