import { useEffect, useState, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { childApi } from '../services/api'
import { Heart, MapPin, Calendar, LogOut, ArrowLeft } from 'lucide-react'
import dashboardBg from '../assets/neighborhood-picnic.png'

export default function Dashboard() {
  const navigate = useNavigate()
  const { familyEntity, loading, logout } = useAuth()
  const [children, setChildren] = useState<any[]>([])

  // Lógica de redirección segura si no hay niños
  useEffect(() => {
    if (
      !loading &&
      familyEntity &&
      (!familyEntity.children || familyEntity.children.length === 0)
    ) {
      navigate('/add-child', { replace: true })
    }
  }, [loading, familyEntity, navigate])

  // Carga de niños
  useEffect(() => {
    if (familyEntity) {
      childApi
        .getAll()
        .then(data => setChildren(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error al cargar niños:', err))
    }
  }, [familyEntity])

  const handleLogout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    await logout()
    navigate('/login', { replace: true })
  }

  // Refugio de seguridad: Evita el bloqueo visual
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white bg-brand-dark">
        <p className="animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  if (!familyEntity) {
    return null // El ProtectedRoute ya debería haber manejado esto
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10 bg-brand-dark/30 backdrop-blur-[2px]" />

      <div className="relative z-30 flex justify-between p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-200 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-500/30 transition-all"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      <div className="relative z-20 px-6 pb-12 mt-20">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 text-center md:text-left">
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">
              Welcome,{' '}
              <span className="text-brand-orange">
                {familyEntity?.familyName || 'Family'}!
              </span>
            </h1>
          </header>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <button
              onClick={() => navigate('/events')}
              className="group relative flex items-center gap-3 px-8 py-4 bg-white/80 hover:bg-white text-brand-dark rounded-full shadow-lg transition-all border border-white/50 hover:scale-105"
            >
              <MapPin className="w-5 h-5 text-brand-coral" />
              <span className="font-black uppercase tracking-widest text-xs">
                Events
              </span>
            </button>

            <button
              onClick={() => navigate('/schedules')}
              className="group relative flex items-center gap-3 px-8 py-4 bg-white/80 hover:bg-white text-brand-dark rounded-full shadow-lg transition-all border border-white/50 hover:scale-105"
            >
              <Calendar className="w-5 h-5 text-brand-coral" />
              <span className="font-black uppercase tracking-widest text-xs">
                Schedules
              </span>
            </button>

            <div className="group relative flex items-center gap-3 px-8 py-4 bg-white/80 text-brand-dark rounded-full shadow-lg border border-white/50 transition-all duration-300 hover:rounded-3xl hover:px-12 cursor-pointer">
              <Heart className="w-5 h-5 text-brand-coral" />
              <span className="font-black uppercase tracking-widest text-xs whitespace-nowrap">
                My Children
              </span>
              <div className="hidden group-hover:flex gap-4 ml-4 pl-4 border-l border-brand-dark/20 animate-in fade-in duration-500">
                {children?.length > 0 ? (
                  children.map((child: any) => (
                    <span
                      key={child?.id}
                      className="text-[10px] font-bold bg-brand-orange/20 px-2 py-1 rounded-md"
                    >
                      {child?.lifeStage?.toLowerCase() || 'n/a'}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] italic">No children yet</span>
                )}
                <button
                  onClick={() => navigate('/add-child')}
                  className="text-[10px] font-black hover:text-brand-coral ml-2"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
