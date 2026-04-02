import { useEffect, useState, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { childApi } from '../services/api'
import type { ChildResponseDTO } from '../types'
import MatchesList from './Matches/MatchesList'
import { Heart, MapPin, LogOut, ArrowLeft, Search, Plus } from 'lucide-react'
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
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!familyEntity) return null

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans bg-[#F8F9FA]">
      {/* BACKGROUND con Blur más suave */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10 bg-white/30 backdrop-blur-[3px]" />

      {/* TOP BAR - Más Minimal */}
      <div className="relative z-30 flex justify-between p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md text-gray-800 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-white/60 transition-all border border-white/20"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-900/5 backdrop-blur-md text-gray-500 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-gray-900/5"
        >
          <LogOut className="w-3 h-3 inline mr-1" /> Log Out
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 px-8 max-w-5xl mx-auto mt-4">
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight leading-none">
            Hola,{' '}
            <span className="font-black italic text-orange-500">
              {familyEntity?.familyName}
            </span>
          </h1>
          <p className="text-gray-500/80 font-medium tracking-[0.1em] text-[10px] uppercase mt-3">
            Your neighborhood, simplified.
          </p>
        </header>

        {/* QUICK ACTIONS - Pills más pequeñas y elegantes */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span className="font-black uppercase tracking-widest text-[10px]">
              Find Neighbors
            </span>
          </button>

          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-full border border-gray-100 shadow-sm transition-all hover:bg-gray-50"
          >
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="font-black uppercase tracking-widest text-[10px]">
              Events
            </span>
          </button>

          <div
            onClick={() => navigate('/my-family')}
            className="group flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-md text-gray-800 rounded-full border border-white/40 cursor-pointer transition-all hover:bg-white"
          >
            <Heart className="w-4 h-4 text-orange-500" />
            <span className="font-black uppercase tracking-widest text-[10px]">
              Children ({children.length})
            </span>
            {/* Pills pequeñas dentro del botón */}
            <div className="flex gap-1 ml-2">
              {children.slice(0, 2).map(child => (
                <span
                  key={child.id}
                  className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                  title={child.lifeStage}
                />
              ))}
              <Plus className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>

        {/* SECCIÓN DE MATCHES - Estética Cristal Minimalista */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-gray-200/50 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">
                Connections
              </h2>
              <div className="h-1 w-8 bg-orange-500 mt-1 rounded-full" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200" />
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300" />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Active now
              </span>
            </div>
          </div>

          {/* LISTA DE CHATS */}
          <div className="min-h-[200px]">
            <MatchesList token={token || ''} />
          </div>
        </div>
      </div>
    </div>
  )
}
