import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import {
  Home,
  Search,
  User,
  LogOut,
  Heart,
  Languages,
  BarChart3,
} from 'lucide-react'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()

  const isActive = (path: string) => location.pathname === path


  const isAdmin =
    user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN')

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      {/* ── LOGO ── */}
      <div
        className="text-2xl font-black text-white cursor-pointer flex items-center gap-2 group"
        onClick={() => navigate(isAdmin ? '/admin/stats' : '/dashboard')}
      >
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
          <Heart className="text-white fill-current w-6 h-6" />
        </div>
        <span className="tracking-tighter">
          Little<span className="text-orange-500">Neighbors</span>
        </span>
      </div>

      {/* ── MENÚ CENTRAL (DINÁMICO POR ROL) ── */}
      <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
        {isAdmin ? (
          <button
            onClick={() => navigate('/admin/stats')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              isActive('/admin/stats')
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />{' '}
            {t('navigation.adminStats', 'Estadísticas')}
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                isActive('/dashboard')
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" /> {t('navigation.dashboard')}
            </button>
            <button
              onClick={() => navigate('/explore')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                isActive('/explore')
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" /> {t('navigation.explore')}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                isActive('/profile')
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" /> {t('navigation.profile')}
            </button>
          </>
        )}
      </div>

      {/* ── BOTONES DERECHA ── */}
      <div className="flex items-center gap-4">
        {!isAdmin && <NotificationBell />}

        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/10">
          <Languages className="w-4 h-4 text-white/40 ml-2 mr-1" />
          {['es', 'va', 'en'].map(lng => (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${
                i18n.language === lng
                  ? 'bg-orange-500 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/10'
              }`}
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={logout}
          className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-xl border border-white/5 transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('common.logout')}
        </button>
      </div>
    </nav>
  )
}
