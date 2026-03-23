import { ArrowLeft, Calendar, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import dashboardBg from '../assets/new-at-neigborhood.png'

export default function SchedulesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen w-full p-6 font-sans flex flex-col overflow-hidden">
      {/* Fondo: Imagen clara, sin blur */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Overlay más claro para dar sensación de brillo y legibilidad */}
      <div className="fixed inset-0 z-10 bg-white/40 backdrop-blur-[2px]" />

      <div className="relative z-20 max-w-4xl mx-auto w-full flex flex-col flex-grow">
        {/* Botón Volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-dark/50 mb-10 font-black uppercase tracking-[0.2em] text-[10px] hover:text-brand-orange transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('back')}
        </button>

        {/* Título Principal */}
        <div className="mb-12">
          <h1 className="text-6xl font-black uppercase text-brand-dark tracking-tighter leading-none drop-shadow-sm">
            {t('schedules')}
          </h1>
          <div className="h-2 w-24 bg-brand-orange mt-4 rounded-full" />
        </div>

        {/* Empty State / Botón de Acción */}
        <div className="flex flex-col items-center justify-center flex-grow py-20">
          <div
            onClick={() => navigate('/add-playdate')}
            className="group flex items-center gap-6 px-8 py-6 bg-white/80 backdrop-blur-md border border-white rounded-[3rem] shadow-2xl cursor-pointer hover:bg-white transition-all active:scale-95 border-b-8 border-b-brand-orange/20"
          >
            <div className="w-16 h-16 bg-brand-orange/10 rounded-[2rem] flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:rotate-12 transition-all duration-300">
              <Calendar className="w-8 h-8 text-brand-orange group-hover:text-white transition-colors" />
            </div>

            <div className="pr-4">
              <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">
                {t('addPlaydate')}
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <Plus className="w-3 h-3 text-brand-orange" />
                {t('submitButton')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
