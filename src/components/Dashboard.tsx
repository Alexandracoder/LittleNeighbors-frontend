import { useEffect, useState, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { childApi } from '../services/api'
import type { ChildResponseDTO } from '../types'
import MatchesList from './Matches/MatchesList'
import {
  Heart,
  MapPin,
  Calendar,
  LogOut,
  ArrowLeft,
  Search,
  Plus,
} from 'lucide-react'
import dashboardBg from '../assets/neighborhood-picnic.png'

export default function Dashboard() {
  const navigate = useNavigate()
  const { familyEntity, loading, logout, token } = useAuth()
  const [children, setChildren] = useState<ChildResponseDTO[]>([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!loading && !familyEntity) {
      navigate('/create-family', { replace: true })
      return
    }

    if (
      !loading &&
      familyEntity &&
      (!familyEntity.children || familyEntity.children.length === 0)
    ) {
      navigate('/add-child', { replace: true })
    }
  }, [loading, familyEntity, navigate])

  // 2. Carga de niños con manejo de estado
  useEffect(() => {
    if (familyEntity && token) {
      setFetching(true)
      childApi
        .getAll()
        .then(data => setChildren(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error loading children:', err))
        .finally(() => setFetching(false))
    }
  }, [familyEntity, token])

  const handleLogout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    await logout()
    navigate('/login', { replace: true })
  }

  if (loading || fetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-black uppercase tracking-widest text-xs animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (!familyEntity) return null

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans">
      {/* BACKGROUND & OVERLAY */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10 bg-gray-900/40 backdrop-blur-[2px]" />

      {/* TOP BAR */}
      <div className="relative z-30 flex justify-between p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-red-500/20 backdrop-blur-md text-red-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/40 transition-all border border-red-500/20"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 px-6 pb-12 mt-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 text-center md:text-left animate-in fade-in slide-in-from-left-10 duration-700">
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
              Hi,{' '}
              <span className="text-orange-500 italic">
                {familyEntity?.familyName || 'Family'}
              </span>
            </h1>
            <p className="text-white/60 font-bold uppercase tracking-[0.3em] text-sm mt-4 ml-2">
              Welcome to your community hub
            </p>
          </header>

          {/* QUICK ACTIONS GRID */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-16">
            <button
              onClick={() => navigate('/events')}
              className="group flex items-center gap-4 px-10 py-6 bg-white hover:bg-orange-500 hover:text-white text-gray-900 rounded-[2rem] shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <MapPin className="w-6 h-6" />
              <span className="font-black uppercase tracking-widest text-sm">
                Events
              </span>
            </button>

            <button
              onClick={() => navigate('/explore')}
              className="group flex items-center gap-4 px-10 py-6 bg-orange-600 text-white rounded-[2rem] shadow-2xl transition-all transform hover:-translate-y-2 hover:bg-orange-500"
            >
              <Search className="w-6 h-6" />
              <span className="font-black uppercase tracking-widest text-sm">
                Find Neighbors
              </span>
            </button>

            <div
              className="group relative flex items-center gap-4 px-10 py-6 bg-white/90 backdrop-blur-xl text-gray-900 rounded-[2rem] shadow-2xl border border-white/50 transition-all duration-500 hover:rounded-[1.5rem] cursor-pointer overflow-hidden"
              onClick={() => navigate('/my-family')}
            >
              <Heart className="w-6 h-6 text-orange-500" />
              <span className="font-black uppercase tracking-widest text-sm whitespace-nowrap">
                My Children ({children.length})
              </span>

              {/* Hover effect to show children tags */}
              <div className="hidden group-hover:flex items-center gap-2 ml-4 pl-4 border-l border-gray-300 animate-in fade-in zoom-in duration-300">
                {children.map(child => (
                  <span
                    key={child.id}
                    className="text-[10px] font-black bg-orange-500 text-white px-3 py-1 rounded-full uppercase"
                  >
                    {child.lifeStage?.split('_')[0]}
                  </span>
                ))}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/add-child')
                  }}
                  className="p-1 bg-gray-900 text-white rounded-full hover:scale-110 transition-transform"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE MATCHES (LISTA DE CHATS) */}
          <div className="bg-gray-900/60 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-3xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                  Neighbor Connections
                </h2>
                <p className="text-orange-500/80 font-bold text-xs uppercase tracking-widest mt-1">
                  Active chats & playdates
                </p>
              </div>
              <div className="bg-orange-500 text-white text-[10px] font-black px-4 py-2 rounded-full">
                {/* Aquí podrías poner el número de mensajes nuevos */}
                LIVE
              </div>
            </div>

            <MatchesList token={token || ''} />
          </div>
        </div>
      </div>
    </div>
  )
}
