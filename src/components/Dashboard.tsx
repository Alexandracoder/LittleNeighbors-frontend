import { useEffect, useState, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { childApi } from '../services/api'
import matchService from '../services/matchService'
import type { ChildResponseDTO } from '../types'
import MainLayout from '../components/layout/MainLayout'
import { NeighborhoodImpact } from '../components/NeighborhoodImpact'
import {
  MapPin,
  Search,
  ArrowLeft,
  Calendar,
  User,
  Baby,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import dashboardBg from '../assets/neighborhood-picnic.png'

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { familyEntity, status, loading, logout, token } = useAuth()
  const [, setChildren] = useState<ChildResponseDTO[]>([])
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [, setFetching] = useState(false)

  useEffect(() => {
    if (familyEntity && token) {
      setFetching(true)


      Promise.all([childApi.getAll(), matchService.getMyMatches()])
        .then(([childData, matchData]) => {
          setChildren(Array.isArray(childData) ? childData : [])
          setActiveChats(Array.isArray(matchData) ? matchData : [])
        })
        .catch(err => console.error('Error loading dashboard data:', err))
        .finally(() => setFetching(false))
    }
  }, [familyEntity, token])

  const handleLogout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    await logout()
    navigate('/login', { replace: true })
  }

if (loading || (status?.hasFamily && !familyEntity)) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#FDF8F3]">
      <div className="w-12 h-12 border-4 border-[#F28749] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}


if (status?.hasFamily && !familyEntity && !loading) {
  return (
    <div className="p-10 text-center text-red-500">
      <p>{t('common.errorLoadingProfile', 'Error al cargar el perfil.')}</p>
    </div>
  )
}

if (!status?.hasFamily) return null

return (
  <MainLayout
    backgroundImage={dashboardBg}

    title={`${t('dashboard.hello')}, ${familyEntity?.familyName}`}
    subtitle={t('dashboard.subtitle')}
    showGlassCard={false}
  >
    <div className="fixed top-20 left-0 w-full px-4 sm:px-6 md:px-12 flex justify-between items-center z-[60] gap-2">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white rounded-full border border-white/20 hover:bg-white/20 transition-all active:scale-95 group shadow-xl shrink-0"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline font-black uppercase tracking-widest text-[10px]">
          {t('common.back')}
        </span>
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white/80 hover:text-white rounded-full border border-white/20 hover:bg-white/20 transition-all active:scale-95 group shadow-xl shrink-0"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline font-black uppercase tracking-widest text-[10px]">
            {t('dashboard.myProfile', 'Mi perfil')}
          </span>
        </button>
      </div>
    </div>

    <div className="flex flex-col items-center gap-6 mt-20 animate-in fade-in zoom-in duration-1000 px-4">
      <div className="flex flex-wrap justify-center gap-4 w-full">
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-3 sm:gap-4 px-8 sm:px-12 py-5 sm:py-6 bg-[#F28749] text-white rounded-full shadow-2xl shadow-orange-950/40 transition-all hover:scale-105 active:scale-95 border-2 border-white/20 max-w-full"
        >
          <Search className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="font-black uppercase tracking-widest text-xs sm:text-sm">
            {t('dashboard.findNeighbors')}
          </span>
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-2xl mb-4 px-2">
        <button
          onClick={() => navigate('/schedules')}
          className="flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-xl text-white rounded-full border-2 border-white/20 shadow-xl transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          <Calendar className="w-5 h-5 text-[#F28749] shrink-0" />
          <span className="font-black uppercase tracking-widest text-xs whitespace-nowrap">
            {t('dashboard.myPlaydates')}
          </span>
        </button>

        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-xl text-white rounded-full border-2 border-white/20 shadow-xl transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          <MapPin className="w-5 h-5 text-[#F28749] shrink-0" />
          <span className="font-black uppercase tracking-widest text-xs whitespace-nowrap">
            {t('dashboard.events')}
          </span>
        </button>

        <button
          onClick={() => navigate('/add-child')}
          className="flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-xl text-white rounded-full border-2 border-white/20 shadow-xl transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          <Baby className="w-5 h-5 text-[#F28749] shrink-0" />
          <span className="font-black uppercase tracking-widest text-xs whitespace-nowrap">
            {t('dashboard.myChildren', 'Mis peques')}
          </span>
        </button>
      </div>

      {/* METRICS DISPLAY HUB */}
      <div className="w-full max-w-4xl px-4">
        <NeighborhoodImpact />
      </div>

      {/* Sección de "Mis Chats" integrada */}
      {activeChats.length > 0 && (
        <div className="w-full max-w-xl mt-4 px-4">
          <h2 className="text-white text-[11px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 opacity-90 justify-center md:justify-start">
            <MessageSquare size={14} className="text-[#F28749]" />
            {t('dashboard.myChats', 'MIS CONVERSACIONES')}
          </h2>

          <div className="grid gap-2.5 w-full">
            {activeChats.map(chat => (
              <button
                key={chat.matchId}
                onClick={() => navigate(`/chat/${chat.matchId}`)}
                className="w-full flex items-center justify-between p-3.5 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F28749] text-white flex items-center justify-center font-black text-xs border border-white/20 shadow-inner">
                    {chat.theirFamilyName
                      ? chat.theirFamilyName.substring(0, 2).toUpperCase()
                      : '??'}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-xs uppercase tracking-wider leading-none group-hover:text-[#F28749] transition-colors">
                      {t('common.family', 'FAMILIA')} {chat.theirFamilyName}
                    </h3>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-tight mt-1">
                      {chat.theirNeighborhoodName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      chat.status === 'ACCEPTED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {chat.status === 'ACCEPTED' ? (
                      <span className="flex items-center gap-1">
                        <Sparkles size={8} />
                        {t('chat.status.match', 'MATCH!')}
                      </span>
                    ) : (
                      t('chat.status.pending', 'PENDING')
                    )}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </MainLayout>
)
}