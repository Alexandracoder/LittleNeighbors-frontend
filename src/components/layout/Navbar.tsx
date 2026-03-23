import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Home, Search, User, LogOut, Heart } from 'lucide-react'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <nav className="relative z-50 flex items-center justify-between px-8 py-6 bg-transparent">
      {/* ── LOGO ── */}
      <div
        className="text-2xl font-black text-white cursor-pointer flex items-center gap-2 group"
        onClick={() => navigate('/dashboard')}
      >
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
          <Heart className="text-white fill-current w-6 h-6" />
        </div>
        <span className="tracking-tighter uppercase">
          Little<span className="text-orange-500">Neighbors</span>
        </span>
      </div>

      {/* ── MENÚ CENTRAL (Glassmorphism) ── */}
      <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
        <button
          onClick={() => navigate('/dashboard')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            isActive('/dashboard')
              ? 'bg-orange-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Home className="w-4 h-4" /> {t('dashboard.hero.title')}
        </button>

        <button
          onClick={() => navigate('/explore')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            isActive('/explore')
              ? 'bg-orange-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-4 h-4" /> {t('dashboard.actions.findPlaymates')}
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            isActive('/profile')
              ? 'bg-orange-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />{' '}
          {t('dashboard.footer').split('•')[1] || 'Profile'}
        </button>
      </div>

      {/* ── BOTONES DERECHA + IDIOMA ── */}
      <div className="flex items-center gap-4">
        {/* Selector de Idiomas */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          {[
            { code: 'es', label: 'ESP' },
            { code: 'en', label: 'ENG' },
            { code: 'va', label: 'VAL' },
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                (i18n.language || 'es').startsWith(lang.code)
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          onClick={logout}
          className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-xl border border-white/5 transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('dashboard.header.logoutButton')}
        </button>
      </div>
    </nav>
  )
}
