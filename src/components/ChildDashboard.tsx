import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useCallback } from 'react'
import {
  Heart,
  Calendar,
  Users,
  ArrowLeft,
  Baby,
  ShieldAlert,
} from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import UserStatus from '../components/UserStatus'
import dashboardBg from '../assets/parent-meeting.png'
import api from '../services/api'
import { UserProfileDTO } from '../types'

export default function ChildDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [currentUser, setCurrentUser] = useState<UserProfileDTO | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. Centralizamos la carga de datos en una función reutilizable
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/me')
      setCurrentUser(response.data)
    } catch (err) {
      console.error('Error refreshing dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${id}&backgroundColor=f8f9fa`

  return (
    <MainLayout
      backgroundImage={dashboardBg}
      title={t('child.dashboard.title', 'Panel de Trobades')}
      subtitle={t('child.dashboard.subtitle', 'Gestió personalitzada')}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white font-black uppercase text-xs tracking-widest transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back', 'Tornar')}
        </button>

        {currentUser && <UserStatus status={currentUser.verificationStatus} />}
      </div>

      {/* Alerta de Verificación */}
      {currentUser?.verificationStatus === 'UNVERIFIED' && (
        <section className="mb-8 bg-orange-500 border-4 border-white rounded-[2.5rem] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce-subtle">
          <div className="flex items-center gap-4 text-white">
            <ShieldAlert size={32} strokeWidth={3} />
            <div>
              <h2 className="font-black text-lg uppercase italic leading-none">
                {t('dashboard.verifyTitle', 'Seguretat primer')}
              </h2>
              <p className="font-bold text-xs opacity-90">
                {t(
                  'dashboard.verifyWarning',
                  'Verifica la teua identitat per a connectar amb altres famílies.',
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/verify-id')}
            className="w-full md:w-auto bg-white text-orange-600 px-6 py-2 rounded-xl font-black uppercase text-[10px] border-2 border-white shadow-lg hover:bg-orange-50 transition-all"
          >
            {t('dashboard.verifyBtn', 'VERIFICAR ARA')}
          </button>
        </section>
      )}

      {/* Perfil del Niño */}
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
          {/* Buscamos el nickname real si el usuario ya cargó */}
          {currentUser?.children?.find(c => c.id === Number(id))?.nickname ||
            `${t('child.dashboard.profilePrefix')} #${id}`}
        </h2>
      </div>

      {/* Acciones del Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* MATCHES */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl flex flex-col items-center text-center transition-transform hover:scale-105">
          <div className="bg-pink-500/20 p-4 rounded-2xl mb-4">
            <Heart className="w-8 h-8 text-pink-400 fill-pink-400/20" />
          </div>
          <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2">
            Matches
          </h3>
          <p className="text-white/60 text-[10px] uppercase font-bold mb-6 italic">
            {/* Si ya hay matches aceptados, podrías mostrar el contador aquí */}
            {t('child.dashboard.matchStatus', 'Cercant nous amics...')}
          </p>
          <button
            onClick={() => navigate('/explore')} // Suponiendo que esta es tu ruta de vecinos
            disabled={currentUser?.verificationStatus !== 'VERIFIED'}
            className="w-full py-3 bg-white/20 border border-white/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#F28749] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.explore', 'Explorar')}
          </button>
        </div>

        {/* PLAYDATES (Aquí podrías pasar loadData si hubiera un form interno) */}
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
            {t('common.upcoming', 'Properes Cites')}
          </button>
        </div>

        {/* COMUNITAT */}
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
            {t('common.groups', 'Veure Grups')}
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
