import { useNavigate } from 'react-router-dom'
import {
  Search,
  Users,
  Heart,
  MapPin,
  Calendar,
  LogOut,
  ArrowLeft,
} from 'lucide-react'
import dashboardBg from '../assets/neighborhood-picnic.png'

export default function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Aquí iría tu lógica de borrar token/contexto
    console.log('Cerrando sesión...')
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans">
      {/* --- FONDO FIJO PERSONALIZADO --- */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10 bg-brand-dark/30 backdrop-blur-[2px]" />

      {/* --- BOTONES DE UTILIDAD (Top Bar) --- */}
      <div className="relative z-30 flex justify-between p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-md text-red-200 rounded-full hover:bg-red-500/40 transition-all font-bold text-xs uppercase tracking-widest border border-red-500/30"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="relative z-20 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 text-center md:text-left">
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
              Welcome, <span className="text-brand-orange">Neighbor!</span>
            </h1>
            <p className="text-orange-50 font-bold mt-2 uppercase tracking-widest text-sm">
              Your community headquarters
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CARD 1: EXPLORE (Find Playmates) */}
            <div className="bg-white/95 backdrop-blur-sm p-10 rounded-[3rem] shadow-2xl border-b-8 border-brand-orange hover:scale-[1.02] transition-all group">
              <div className="bg-brand-orange/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                <Users className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-brand-dark mb-4 uppercase">
                Find Playmates
              </h2>
              <p className="text-gray-500 font-medium mb-8">
                Connect with local families and find the perfect friends for
                your kids.
              </p>
              <button
                onClick={() => navigate('/explore')}
                className="flex items-center gap-3 px-8 py-5 bg-brand-orange text-white font-black rounded-2xl shadow-lg hover:bg-brand-dark transition-all uppercase tracking-widest text-xs w-full justify-center"
              >
                <Search className="w-5 h-5" /> Explore Neighborhood
              </button>
            </div>

            {/* CARD 2: SCHEDULES (Planned Playdates) */}
            <div className="bg-white/95 backdrop-blur-sm p-10 rounded-[3rem] shadow-2xl border-b-8 border-brand-coral hover:scale-[1.02] transition-all group">
              <div className="bg-brand-coral/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-coral group-hover:text-white transition-colors text-brand-coral">
                <Calendar className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-brand-dark mb-4 uppercase">
                Schedules
              </h2>
              <p className="text-gray-500 font-medium mb-8">
                Manage your upcoming meetups and see who's coming to the park.
              </p>
              <button
                onClick={() => navigate('/schedules')}
                className="flex items-center gap-3 px-8 py-5 border-2 border-brand-coral text-brand-coral font-black rounded-2xl hover:bg-brand-coral hover:text-white transition-all uppercase tracking-widest text-xs w-full justify-center"
              >
                <Heart className="w-5 h-5" /> View My Playdates
              </button>
            </div>
          </div>

          {/* BARRA INFERIOR: INFO ÁREA */}
          <div className="mt-12 bg-brand-dark/80 backdrop-blur-md text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-brand-orange p-3 rounded-full">
                <MapPin className="text-brand-dark w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
                  Active Community
                </p>
                <p className="font-bold text-xl">Valencia, Spain</p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-3xl font-black italic text-brand-orange">
                  24
                </p>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                  Neighbors
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black italic text-brand-coral">
                  15
                </p>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                  Events
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
