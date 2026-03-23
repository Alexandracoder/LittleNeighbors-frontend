import { useEffect, useState, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { childApi } from '../services/api'
import MatchesList from './Matches/MatchesList'
import type { ChildResponseDTO } from '../types'
import {
  Heart,
  MapPin,
  Calendar,
  LogOut,
  ArrowLeft,
  Search,
} from 'lucide-react'
import dashboardBg from '../assets/neighborhood-picnic.png'

export default function Dashboard() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { familyEntity, loading, logout } = useAuth()
  const [children, setChildren] = useState<ChildResponseDTO[]>([])

  useEffect(() => {
    if (familyEntity) {
      childApi
        .getAll()
        .then(data => {
          setChildren(Array.isArray(data) ? data : [])
        })
        .catch(err => console.error('Error loading children:', err))
    }
  }, [familyEntity])

  const handleLogout = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    logout()
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white bg-brand-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <p className="font-black uppercase tracking-widest text-xs animate-pulse">
            {t('loading')}
          </p>
        </div>
      </div>
    )
  }

  if (!familyEntity) return null

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans">
      {/* Background Layer */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10 bg-brand-dark/40 backdrop-blur-[2px]" />

      {/* TOP BAR / NAVBAR */}
      <div className="relative z-30 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </button>

        {/* Language Selector */}
        <div className="flex gap-1 bg-black/40 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl">
          {['es', 'en', 'va'].map(lang => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all uppercase tracking-tighter ${
                i18n.language.startsWith(lang)
                  ? 'bg-brand-orange text-white shadow-lg scale-105'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang === 'va' ? 'VAL' : lang.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-md text-red-200 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-500/40 transition-all border border-red-500/20"
        >
          <LogOut className="w-4 h-4" /> {t('logout')}
        </button>
      </div>

      <div className="relative z-20 px-6 pb-12 mt-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 text-center md:text-left">
            <span className="text-brand-orange font-black uppercase tracking-[0.3em] text-[10px]">
              {t('Your community hub')}
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none mt-2">
              {t('welcome')} <br className="md:hidden" />
              <span className="text-brand-orange italic drop-shadow-lg ml-2">
                {familyEntity?.familyName || 'Family'}!
              </span>
            </h1>
          </header>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-16">
            <ActionButton
              icon={<MapPin className="w-5 h-5" />}
              label={t('events')}
              onClick={() => navigate('/events')}
            />
            <ActionButton
              icon={<Calendar className="w-5 h-5" />}
              label={t('schedules')}
              onClick={() => navigate('/schedules')}
            />
            <ActionButton
              icon={<Search className="w-5 h-5" />}
              label={t('explore')}
              onClick={() => navigate('/explore')}
              primary
            />

            <div
              className="group relative flex items-center gap-3 px-8 py-4 bg-white/90 text-brand-dark rounded-full shadow-xl border border-white/50 transition-all duration-500 hover:rounded-3xl hover:px-10 cursor-pointer"
              onClick={() => navigate('/my-family')}
            >
              <Heart className="w-5 h-5 text-brand-coral fill-brand-coral" />
              <span className="font-black uppercase tracking-widest text-[11px] whitespace-nowrap">
                {t('my children')}
              </span>

              <div className="hidden group-hover:flex items-center gap-3 ml-4 pl-4 border-l border-brand-dark/10 animate-in slide-in-from-left-2 duration-300">
                {children.length > 0 ? (
                  children.map((child, idx) => (
                    <div
                      key={child.id || idx}
                      className="text-[9px] font-black bg-brand-dark text-white px-2 py-1 rounded-full uppercase tracking-tighter"
                    >
                      {child.lifeStage === 'PREGNANCY'
                        ? 'PRE'
                        : child.gender === 'BOY'
                        ? 'BOY'
                        : 'GIRL'}
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] font-bold opacity-40 italic lowercase">
                    {t('empty')}
                  </span>
                )}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/add-child')
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-brand-orange text-white rounded-full hover:rotate-90 transition-transform font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Connections Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-brand-dark/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    {t('connections')}
                  </h2>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">
                    {t('connected neighbors')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                </div>
              </div>

              <MatchesList
                onSelectMatch={(match: { id: any }) =>
                  navigate(`/chat/${match.id}`)
                }
              />
            </div>

            {/* Neighborhood Card */}
            <div className="bg-brand-orange rounded-[2.5rem] p-8 text-brand-dark flex flex-col justify-between overflow-hidden relative min-h-[300px]">
              <div className="relative z-10">
                <h3 className="font-black uppercase text-4xl tracking-tighter leading-none mb-4">
                  {t('neighborhood')}
                </h3>
                <p className="font-bold text-sm opacity-80">
                  {t('families in your area')}
                </p>
              </div>
              <button
                onClick={() => navigate('/explore')}
                className="relative z-10 w-full py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] mt-8 hover:bg-black transition-all hover:scale-[1.02] shadow-xl"
              >
                {t('explore')}
              </button>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  primary?: boolean
}

function ActionButton({
  icon,
  label,
  onClick,
  primary = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 px-8 py-4 rounded-full shadow-lg transition-all border hover:scale-105 active:scale-95 ${
        primary
          ? 'bg-brand-orange text-white border-brand-orange/50 hover:bg-brand-orange/90 shadow-brand-orange/20'
          : 'bg-white/90 text-brand-dark border-white/50 hover:bg-white'
      }`}
    >
      <span className={primary ? 'text-white' : 'text-brand-coral'}>
        {icon}
      </span>
      <span className="font-black uppercase tracking-widest text-[11px]">
        {label}
      </span>
    </button>
  )
}
