import { useEffect, useState, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { childApi } from '../services/api'
import type { ChildResponseDTO } from '../types'
import MainLayout from '../components/layout/MainLayout'
import {
  Heart,
  MapPin,
  LogOut,
  Search,
  ArrowLeft,
  Calendar,
  User,
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
        <div className="w-8 h-8 border-2 border-[#F28749] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!familyEntity) return null

  return (
    <MainLayout
      backgroundImage={dashboardBg}
      title={`Hola, ${familyEntity?.familyName}`}
      subtitle="Your neighborhood, simplified."
      showGlassCard={false}
    >
      {/* --- NAVEGACIÓN SUPERIOR --- */}
      <div className="fixed top-8 left-0 w-full px-6 md:px-12 flex justify-between items-center z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white rounded-full border border-white/20 hover:bg-white/20 transition-all active:scale-95 group shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-black uppercase tracking-widest text-[10px]">
            Back
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white/80 hover:text-red-400 rounded-full border border-white/20 hover:bg-white/20 transition-all active:scale-95 group shadow-xl"
        >
          <span className="font-black uppercase tracking-widest text-[10px]">
            Sign Out
          </span>
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex flex-col items-center gap-6 mt-20 animate-in fade-in zoom-in duration-1000">
        {/* ACCIÓN PRINCIPAL: EXPLORAR */}
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-4 px-12 py-6 bg-[#F28749] text-white rounded-full shadow-2xl shadow-orange-950/40 transition-all hover:scale-105 active:scale-95 border-2 border-white/20"
          >
            <Search className="w-6 h-6" />
            <span className="font-black uppercase tracking-widest text-sm">
              Find Neighbors
            </span>
          </button>
        </div>

        {/* ACCIONES SECUNDARIAS */}
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
          {/* MY PLAYDATES (Schedules) */}
          <button
            onClick={() => navigate('/my-schedules')}
            className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-full border-2 border-white/20 shadow-xl transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <Calendar className="w-5 h-5 text-[#F28749]" />
            <span className="font-black uppercase tracking-widest text-xs">
              My Playdates
            </span>
          </button>

          {/* EVENTS */}
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-full border-2 border-white/20 shadow-xl transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <MapPin className="w-5 h-5 text-[#F28749]" />
            <span className="font-black uppercase tracking-widest text-xs">
              Events
            </span>
          </button>

          {/* MY PROFILE (Para gestionar hijos y datos) */}
          <button
            onClick={() => navigate('/add-child')}
            className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-full border-2 border-white/20 shadow-xl transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <User className="w-5 h-5 text-[#F28749]" />
            <span className="font-black uppercase tracking-widest text-xs">
              My Profile
            </span>
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
