import { useState } from 'react'
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
  Menu,
  X,
} from 'lucide-react'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path


  const isAdmin =
    user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN')

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const goTo = (path: string) => {
    setMobileMenuOpen(false)
    navigate(path)
  }

  const navLinks = isAdmin
    ? [{ path: '/admin/stats', label: t('navigation.adminStats', 'Estadísticas'), icon: BarChart3 }]
    : [
        { path: '/dashboard', label: t('navigation.dashboard'), icon: Home },
        { path: '/explore', label: t('navigation.explore'), icon: Search },
        { path: '/profile', label: t('navigation.profile'), icon: User },
      ]

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
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
      <div className="flex items-center gap-2 md:gap-4">
        {!isAdmin && <NotificationBell />}

        {/* Selector de idioma: visible siempre en desktop, oculto en móvil (vive en el menú hamburguesa) */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/10">
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

        {/* Logout con texto: solo desktop */}
        <button
          onClick={logout}
          className="hidden md:flex group items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-xl border border-white/5 transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('common.logout')}
        </button>

        {/* Botón hamburguesa: solo móvil */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label={mobileMenuOpen ? t('common.closeMenu', 'Cerrar menú') : t('common.openMenu', 'Abrir menú')}
          aria-expanded={mobileMenuOpen}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── PANEL MÓVIL (enlaces + idioma + logout, apilados) ── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[64px] z-40 bg-black/40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="absolute top-full left-0 w-full md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/10 z-50 flex flex-col gap-1 p-4"
          >
            {navLinks.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => goTo(path)}
                className={`w-full px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
                  isActive(path)
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 mt-2">
              <Languages className="w-4 h-4 text-white/40 ml-2 mr-1" />
              {['es', 'va', 'en'].map(lng => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={`flex-1 px-2 py-2 rounded-lg text-xs font-black transition-all ${
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
              onClick={() => goTo('/privacy')}
              className="w-full text-center text-white/30 hover:text-white/60 text-[10px] font-bold uppercase tracking-widest py-2 transition-colors"
            >
              {t('privacy.footerLink', 'Privacidad')}
            </button>

            <button
              onClick={logout}
              className="w-full mt-2 group flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-xl border border-white/5 transition-all font-bold text-sm"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t('common.logout')}
            </button>
          </div>
        </>
      )}
    </nav>
  )
}
