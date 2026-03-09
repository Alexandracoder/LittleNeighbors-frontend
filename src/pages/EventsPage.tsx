import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import dashboardBg from '../assets/playing-together.png'

export default function EventsPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen w-full p-6 text-brand-dark font-sans">
      {/* Fondo con imagen */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Overlay BLANCO para dar brillo y claridad */}
      <div className="fixed inset-0 z-10 bg-white/40" />

      <div className="relative z-20 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-dark/70 mb-8 font-black uppercase tracking-widest text-xs hover:text-brand-dark transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-5xl font-black uppercase mb-10 text-brand-dark drop-shadow-sm">
          Neighborhood Events
        </h1>

        {/* Card más clara para mantener la coherencia */}
        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 shadow-xl">
          <div className="flex gap-4 items-center">
            <div className="bg-brand-coral text-white p-4 rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Upcoming Picnic at the Park</h3>
              <p className="text-brand-orange text-sm font-bold uppercase tracking-wider">
                March 15th, 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
