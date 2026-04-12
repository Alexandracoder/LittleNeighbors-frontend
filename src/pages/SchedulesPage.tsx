import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dashboardBg from '../assets/new-at-neigborhood.png'

export default function SchedulesPage() {
  const navigate = useNavigate()

  const [playdates, setPlaydates] = useState<any[]>([
    /* Descomenta para probar el diseño:
    {
      id: 1,
      title: "Paseo al Parque Central",
      neighborName: "Familia García",
      date: "12 Oct",
      time: "10:30 AM",
      status: "CONFIRMED"
    } 
    */
  ])

  return (
    <div className="relative min-h-screen w-full p-6 text-white font-sans flex flex-col">
      {/* FONDO: TU FOTO ORIGINAL (Nítida y con sus colores) */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* OVERLAY SUTIL: Un degradado oscuro pero MUY transparente solo para dar contraste al texto */}
      {/* Esto asegura que la foto se siga viendo nítida en un 90% */}
      <div className="fixed inset-0 z-10 bg-gradient-to-br from-black/40 to-transparent via-transparent" />

      {/* Contenido principal (z-20) */}
      <div className="relative z-20 max-w-2xl mx-auto w-full flex flex-col flex-grow">
        {/* Header Navigation - Ahora más brillante para destacar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-dark/90 mb-8 font-black uppercase tracking-widest text-[10px] hover:text-brand-dark transition-all bg-white w-fit px-5 py-2.5 rounded-full shadow-lg border border-white"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </button>

        {/* TÍTULO: Usamos un drop-shadow fuerte para que el naranja y el negro resalten */}
        <h1 className="text-5xl font-black uppercase text-brand-dark mb-10 italic tracking-tighter drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]">
          My <span className="text-[#F28749]">Playdates</span>
        </h1>

        {/* Lógica de Renderizado */}
        {playdates.length > 0 ? (
          <div className="space-y-4">
            {playdates.map(pd => (
              <div
                key={pd.id}
                className="bg-white/95 rounded-[2.5rem] p-6 shadow-2xl border border-white flex items-center justify-between group hover:scale-[1.01] transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#F28749] rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-lg shadow-orange-200">
                    <span className="text-[10px] font-black uppercase leading-none">
                      {pd.date.split(' ')[1]}
                    </span>
                    <span className="text-2xl font-black leading-tight">
                      {pd.date.split(' ')[0]}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-brand-dark font-black uppercase text-base leading-tight">
                      {pd.title}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        <MapPin size={12} className="text-[#F28749]" /> with{' '}
                        {pd.neighborName}
                      </p>
                      <p className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={12} /> {pd.time}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    pd.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {pd.status}
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/add-playdate')}
              className="w-full py-5 mt-4 border-2 border-dashed border-brand-dark/20 rounded-[2rem] text-brand-dark/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/50 hover:border-brand-dark/40 transition-all"
            >
              + Propose another playdate
            </button>
          </div>
        ) : (
          /* Estado Vacío - Ahora un poco más opaco para dar contraste */
          <div
            onClick={() => navigate('/add-playdate')}
            className="group flex items-center gap-5 px-10 py-8 bg-white/95 rounded-[3rem] shadow-2xl cursor-pointer hover:bg-white transition-all active:scale-95 border border-white"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-inner group-hover:bg-orange-50 transition-colors">
              <Calendar className="w-7 h-7 text-[#F28749]" />
            </div>

            <div>
              <h2 className="text-xl font-black text-brand-dark uppercase italic tracking-tighter">
                No Playdates Yet
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none mt-1 group-hover:text-[#F28749] transition-colors">
                Get started today
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
