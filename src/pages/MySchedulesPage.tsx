import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import playdateService from '../services/playdateService'
import dashboardBg from '../assets/new-at-neigborhood.png'
import { Playdate } from '../types'

const MySchedulesPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [playdates, setPlaydates] = useState<Playdate[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchAllPlaydates = async () => {
    try {
      const response = await playdateService.getAllMyPlaydates()
      if (Array.isArray(response)) {
        setPlaydates(response)
      }
    } catch (error) {
      console.error('Error fetching all playdates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllPlaydates()
  }, [])

  const handleConfirm = async (playdateId: number) => {
    setActionLoading(playdateId)
    try {
      await playdateService.confirm(playdateId)
      await fetchAllPlaydates()
    } catch (error) {
      console.error('Error confirming playdate:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-white font-black uppercase tracking-widest animate-pulse">
          {t('playdates.status.loadingAgenda')}
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
          onClick={() => navigate('/dashboard')}
          className="bg-white text-gray-800 mb-8 flex w-fit items-center gap-2 rounded-full px-5 py-2.5 font-black uppercase tracking-widest text-[10px] shadow-lg border border-white transition-all hover:scale-105"
        >
          <ArrowLeft className="w-3 h-3" /> {t('common.back')}
        </button>

        <h1 className="text-5xl font-black uppercase text-white mb-10 italic tracking-tighter drop-shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
          {t('playdates.page.agendaTitle')}{' '}
          <span className="text-[#F28749]">
            {t('playdates.page.agendaHighlight')}
          </span>
        </h1>

        {playdates.length > 0 ? (
          <div className="space-y-4">
            {playdates.map(pd => {
              const dateObj = new Date(pd.startTime)

              // Formato dinámico según el idioma seleccionado
              const day = dateObj.getDate()
              const month = dateObj.toLocaleString(i18n.language, {
                month: 'short',
              })
              const time = dateObj.toLocaleTimeString(i18n.language, {
                hour: '2-digit',
                minute: '2-digit',
              })

              const isAccepted = pd.status === 'ACCEPTED'

              return (
                <div
                  key={pd.id}
                  className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-6 shadow-2xl border border-white transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-16 h-16 ${
                          isAccepted ? 'bg-green-500' : 'bg-[#F28749]'
                        } rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-lg`}
                      >
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
                        <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">
                          {t('playdates.card.matchRef')}: #{pd.matchId}
                        </p>
                        <div className="flex flex-col gap-1">
                          <p className="flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={12} /> {time}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        isAccepted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {isAccepted
                        ? t('playdates.status.accepted')
                        : t('playdates.status.pending')}
                    </div>
                  </div>

                  {!isAccepted && (
                    <button
                      onClick={() => handleConfirm(pd.id)}
                      disabled={actionLoading === pd.id}
                      className="mt-6 w-full bg-[#F28749] hover:bg-[#e0763a] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {actionLoading === pd.id
                        ? t('playdates.status.confirming')
                        : t('playdates.form.confirmPlan')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-sm rounded-[3rem] p-12 text-center border border-white">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900 uppercase italic">
              {t('playdates.status.emptyAgenda')}
            </h2>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-2">
              {t('playdates.status.emptySubtitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MySchedulesPage
