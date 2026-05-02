import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Calendar, Users, ArrowLeft, Baby } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import dashboardBg from '../assets/parent-meeting.png'

export default function ChildDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Avatar coherente con la ChildCard
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${id}&backgroundColor=f8f9fa`

  return (
    <MainLayout
      backgroundImage={dashboardBg}
      title={t('child.dashboard.title', 'Panel de Trobades')}
      subtitle={t('child.dashboard.subtitle', 'Gestió personalitzada')}
    >
      {/* 1. BOTÓN VOLVER (Fuera de las cards para que no estorbe) */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/80 hover:text-white mb-8 font-black uppercase text-xs tracking-widest transition-colors bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/20"
      >
        <ArrowLeft className="w-4 h-4" /> {t('common.back', 'Tornar')}
      </button>

      {/* 2. HEADER DEL NIÑO (Avatar y ID/Nombre) */}
      <div className="flex flex-col items-center mb-12 animate-in fade-in zoom-in duration-500">
        <div className="relative w-32 h-32 mb-4">
          <div className="absolute inset-0 bg-[#F28749]/20 rounded-full blur-2xl"></div>
          <img
            src={avatarUrl}
            className="relative z-10 w-full h-full rounded-full border-4 border-white shadow-2xl bg-white"
            alt="Avatar"
          />
          <div className="absolute -bottom-2 -right-2 bg-[#F28749] p-2 rounded-full shadow-lg z-20 border-2 border-white">
            <Baby className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">
          {t('child.dashboard.profilePrefix', 'Perfil')} #{id}
        </h2>
      </div>

      {/* 3. GRID DE SECCIONES (Conectamos las funcionalidades) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CARD: MATCHES */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl flex flex-col items-center text-center transition-transform hover:scale-105">
          <div className="bg-pink-500/20 p-4 rounded-2xl mb-4">
            <Heart className="w-8 h-8 text-pink-400 fill-pink-400/20" />
          </div>
          <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2">
            Matches
          </h3>
          <p className="text-white/60 text-[10px] uppercase font-bold mb-6 italic">
            Cercant nous amics...
          </p>
          <button className="w-full py-3 bg-white/20 border border-white/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#F28749] transition-all">
            Explorar
          </button>
        </div>

        {/* CARD: PLAYDATES */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl flex flex-col items-center text-center transition-transform hover:scale-105">
          <div className="bg-orange-500/20 p-4 rounded-2xl mb-4">
            <Calendar className="w-8 h-8 text-[#F28749]" />
          </div>
          <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2">
            Playdates
          </h3>
          <p className="text-white/60 text-[10px] uppercase font-bold mb-6 italic">
            Gestiona les cites
          </p>
          <button className="w-full py-3 bg-white/20 border border-white/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#F28749] transition-all">
            Properes Cites
          </button>
        </div>

        {/* CARD: COMUNIDAD */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl flex flex-col items-center text-center transition-transform hover:scale-105">
          <div className="bg-blue-500/20 p-4 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2">
            Comunitat
          </h3>
          <p className="text-white/60 text-[10px] uppercase font-bold mb-6 italic">
            Grups del barri
          </p>
          <button className="w-full py-3 bg-white/20 border border-white/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#F28749] transition-all">
            Veure Grups
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
