import { ArrowLeft, Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"
import dashboardBg from '../assets/new-at-neigborhood.png'

export default function SchedulesPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen w-full p-6 text-white font-sans flex flex-col">
      {/* Fondo: Imagen clara, sin blur */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Overlay más claro para dar sensación de brillo */}
      <div className="fixed inset-0 z-10 bg-white/30" />

      <div className="relative z-20 max-w-4xl mx-auto w-full flex flex-col flex-grow">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-dark/70 mb-8 font-black uppercase tracking-widest text-xs hover:text-brand-dark transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-5xl font-black uppercase text-brand-dark drop-shadow-sm">
          My Playdates
        </h1>

{/* He añadido 'cursor-pointer', 'hover:bg-gray-50' y 'transition-all' */}
<div 
  onClick={() => navigate('/add-playdate')} // O la ruta que prefieras
  className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 transition-all active:scale-95"
>
  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
    <Calendar className="w-4 h-4 text-gray-400" />
  </div>
  
  <div className="pr-2">
    <h2 className="text-sm font-black text-gray-900 whitespace-nowrap">
      No Playdates Yet
    </h2>
    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
      Get started today
    </p>
  </div>
</div>
</div>
        </div>
  )
}
