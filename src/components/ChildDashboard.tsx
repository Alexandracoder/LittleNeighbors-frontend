import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useCallback } from 'react'
import { translateNickname } from '../utils/nicknames'
import {
  Heart,
  Calendar,
  Users,
  ArrowLeft,
  Baby,
  ShieldAlert,
  X,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import UserStatus from '../components/UserStatus'
import dashboardBg from '../assets/parent-meeting.png'
import api from '../services/api'
import { UserProfileDTO } from '../types'

import avatar1 from '../assets/Avatar1.jpg'
import avatar2 from '../assets/Avatar2.jpg'
import avatar3 from '../assets/Avatar3.jpg'
import avatar4 from '../assets/Avatar4.jpg'

const localAvatars = [avatar1, avatar2, avatar3, avatar4]
import { CHILD_AVATARS } from '../utils/childAvatars'

export default function ChildDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [currentUser, setCurrentUser] = useState<UserProfileDTO | null>(null)

  const [isPlaydatesModalOpen, setIsPlaydatesModalOpen] = useState(false)
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const response = await api.get('/users/me')
      setCurrentUser(response.data)
    } catch (err) {
      console.error('Error refreshing dashboard:', err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Traducción del nickname técnico (ej: magic_lion) centralizada en utils/nicknames.ts
  const getTranslatedNickname = (nick: string | undefined) =>
    translateNickname(nick, t)

  const currentChild = currentUser?.family?.children?.find(
    c => String(c.id) === String(id),
  )

  const neighborhoodName =
    currentUser?.family?.neighborhood?.name || 'the neighborhood'

  const dummyPlaydates = [
    {
      id: 1,
      title: t('playdates.dummy1.title', 'Snack & Games at the Park'),
      location: 'Parc de Capçalera, València',
      time: '23/05/2026 - 17:30',
      status: 'ACCEPTED',
      partner: 'magic_lion', // Ejemplo de formato técnico
    },
    {
      id: 2,
      title: t('playdates.dummy2.title', 'Bike Ride & Swings'),
      location: 'Jardins del Túria (Tram XI), València',
      time: '30/05/2026 - 11:00',
      status: 'PENDING',
      partner: 'brave_fox', // Ejemplo de formato técnico
    },
  ]

  const dummyGroups = [
    {
      id: 1,
      name: `${t(
        'groups.prefix.crianza',
        'Active Parenting',
      )} - ${neighborhoodName}`,
      description: t(
        'groups.dummy1.desc',
        'Group to share experiences, family corners, and mutual support in the neighborhood.',
      ),
      members: 24,
    },
    {
      id: 2,
      name: t('groups.dummy2.name', 'Weekend Family Routes'),
      description: t(
        'groups.dummy2.desc',
        "Stroller-friendly walks or short trips to L'Albufera and Valencia beaches.",
      ),
      members: 18,
    },
  ]

  // Mismo criterio que en ChildCard: se respeta el avatar elegido de
  // verdad si existe, y solo se usa el reparto pseudoaleatorio antiguo
  // como último recurso.
  const chosenAvatar = currentChild?.avatarKey
    ? CHILD_AVATARS.find(a => a.key === currentChild.avatarKey)?.src
    : null
  const currentAvatarIndex = Math.abs(Number(id || 0)) % localAvatars.length
  const currentAvatar = chosenAvatar ?? localAvatars[currentAvatarIndex]

  return (
    <MainLayout
      backgroundImage={dashboardBg}
      title={t('child.dashboard.title', 'Playdates Dashboard')}
      subtitle={t('child.dashboard.subtitle', 'Personalized management')}
      variant="dark"
    >
      <div className="flex justify-between items-center mb-6 w-full px-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest transition-transform hover:scale-105 bg-white px-5 py-2.5 rounded-full shadow-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />{' '}
          {t('common.back', 'Back')}
        </button>
        {currentUser && <UserStatus status={currentUser.verificationStatus} />}
      </div>

      {currentUser?.verificationStatus === 'UNVERIFIED' && (
        <section className="mb-8 bg-orange-500 border-4 border-white rounded-[2.5rem] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce-subtle">
          <div className="flex items-center gap-4 text-white">
            <ShieldAlert size={32} strokeWidth={3} />
            <div>
              <h2 className="font-black text-lg uppercase italic leading-none">
                {t('dashboard.verifyTitle', 'Safety First')}
              </h2>
              <p className="font-bold text-xs opacity-90">
                {t(
                  'dashboard.verifyWarning',
                  'Verify your identity to connect with other families.',
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/verify-id')}
            className="w-full md:w-auto bg-white text-orange-600 px-6 py-2 rounded-xl font-black uppercase text-[10px] border-2 border-white shadow-lg hover:bg-orange-50 transition-all"
          >
            {t('dashboard.verifyBtn', 'VERIFY NOW')}
          </button>
        </section>
      )}

      <div className="w-full bg-[#c87a4b] rounded-[3rem] sm:rounded-[3.5rem] p-5 sm:p-8 shadow-2xl border-4 border-white/10 relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 w-56 h-12 bg-transparent rounded-b-[3rem] pointer-events-none"></div>
        <div className="bg-[#b36638] absolute top-0 px-8 sm:px-12 py-3 rounded-b-[2.5rem] shadow-inner border-x border-b border-white/5 flex items-center justify-center">
          <span className="text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-90 whitespace-nowrap">
            {t('child.dashboard.title', 'Playdates Dashboard')}
          </span>
        </div>

        <div className="flex flex-col items-center mt-10 mb-8 w-full relative z-10 px-2">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4">
            <img
              src={currentAvatar}
              className="w-full h-full rounded-full border-4 border-white shadow-2xl bg-white p-1 object-cover"
              alt="Avatar"
            />
            <div className="absolute bottom-0 right-0 bg-[#e37d39] p-2 rounded-full shadow-md border-2 border-white flex items-center justify-center">
              <Baby className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight drop-shadow-md bg-black/10 px-4 sm:px-6 py-1.5 rounded-full backdrop-blur-sm border border-white/10 max-w-full truncate">
            {currentChild?.nickname
              ? getTranslatedNickname(currentChild.nickname)
              : `${t('child.dashboard.profilePrefix', 'Profile of')} #${id}`}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-10 mt-2">
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-xl flex flex-col items-center text-center justify-between min-h-[220px]">
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-2xl mb-3">
                <Heart className="w-6 h-6 text-white fill-white/20" />
              </div>
              <h3 className="text-white font-black uppercase text-xs tracking-wider mb-1">
                Matches
              </h3>
              <p className="text-white/80 text-[10px] font-bold italic px-2">
                {t('child.dashboard.matchStatus', 'Looking for new friends...')}
              </p>
            </div>
            <button
              onClick={() => navigate(`/dashboard?childId=${id}`)}
              disabled={currentUser?.verificationStatus !== 'VERIFIED'}
              className="w-full py-3 bg-[#be642a] hover:bg-[#a5521f] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed border border-white/10"
            >
              {t('common.viewMatches', 'Ver matches')}
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-xl flex flex-col items-center text-center justify-between min-h-[220px]">
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-2xl mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-black uppercase text-xs tracking-wider mb-1">
                Playdates
              </h3>
              <p className="text-white/80 text-[10px] font-bold italic px-2">
                Expect meetates and playdates
              </p>
            </div>
            <button
              onClick={() => setIsPlaydatesModalOpen(true)}
              className="w-full py-3 bg-[#be642a] hover:bg-[#a5521f] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-md border border-white/10"
            >
              {t('common.upcoming', 'Play now')}
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-xl flex flex-col items-center text-center justify-between min-h-[220px]">
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-2xl mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-black uppercase text-xs tracking-wider mb-1">
                Community
              </h3>
              <p className="text-white/80 text-[10px] font-bold italic px-2">
                Community with and community
              </p>
            </div>
            <button
              onClick={() => setIsCommunityModalOpen(true)}
              className="w-full py-3 bg-[#be642a] hover:bg-[#a5521f] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-md border border-white/10"
            >
              {t('common.groups', 'Visit now')}
            </button>
          </div>
        </div>
      </div>

      {isPlaydatesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] w-full max-w-xl p-5 sm:p-8 relative shadow-2xl border border-white/10 text-white transform transition-all animate-zoom-in">
            <button
              onClick={() => setIsPlaydatesModalOpen(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#F28749] to-orange-600 p-3 rounded-2xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  {t('common.upcoming', 'Upcoming Playdates')}
                </h3>
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                  {t('playdates.subtitle', 'Active play agendas')}
                </p>
              </div>
            </div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {dummyPlaydates.map(date => (
                <div
                  key={date.id}
                  className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-[#F28749]/40 transition-all"
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h4 className="font-black text-base text-white uppercase tracking-tight">
                      {date.title}
                    </h4>
                    <span
                      className={`text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider ${
                        date.status === 'ACCEPTED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {date.status === 'ACCEPTED'
                        ? t('status.accepted', 'Accepted')
                        : t('status.pending', 'Pending')}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-medium mb-4">
                    {t('playdates.with', 'Playdate with')}:{' '}
                    <span className="font-black text-[#F28749] uppercase tracking-wide">
                      {getTranslatedNickname(date.partner)}
                    </span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-white/80 bg-black/20 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#F28749]" />
                      <span>{date.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-pink-400" />
                      <span>{date.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isCommunityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] w-full max-w-xl p-5 sm:p-8 relative shadow-2xl border border-white/10 text-white transform transition-all animate-zoom-in">
            <button
              onClick={() => setIsCommunityModalOpen(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  {t('common.groups', 'Neighborhood Groups')}
                </h3>
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                  {t('groups.subtitle', 'Community in sync')}
                </p>
              </div>
            </div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {dummyGroups.map(group => (
                <div
                  key={group.id}
                  className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-center gap-4 mb-2">
                      <h4 className="font-black text-base text-white uppercase tracking-tight">
                        {group.name}
                      </h4>
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                        {group.members} {t('groups.members', 'families')}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 font-medium leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />{' '}
                    {t('groups.join', 'Join group')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
