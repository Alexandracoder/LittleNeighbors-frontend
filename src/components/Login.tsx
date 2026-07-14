import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

import loginBg from '../assets/playing-together.png'

export default function Login() {
  const { t, i18n, ready } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [showForm, setShowForm] = useState(false)
  const [bgLoaded, setBgLoaded] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!ready) {
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError(t('auth.login.errorInvalidCredentials'))
      } else {
        setError(t('auth.login.errorConnection'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* Selector de idiomas */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        {['en', 'es', 'va'].map(lng => (
          <button
            key={lng}
            onClick={() => i18n.changeLanguage(lng)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2 ${
              i18n.language === lng
                ? 'bg-brand-orange border-brand-orange text-white shadow-lg scale-110'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/30 backdrop-blur-md'
            }`}
          >
            {lng.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Imagen de fondo con blur dinámico.
          Antes esto era un <div> con backgroundImage por CSS: el navegador
          no le da prioridad de descarga y, sobre todo justo después de un
          logout (recarga completa de la página), se veía primero el botón
          y unos instantes después la foto. Ahora usamos:
          1) un degradado de marca como fondo instantáneo (sin blanco/vacío)
          2) una <img> real (loading="eager") que hace fade-in suave al
             terminar de cargar, en vez de aparecer de golpe. */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-br from-[#FF8A5C] via-[#F28749] to-[#e0763d]"
        aria-hidden="true"
      />
      <img
        src={loginBg}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        onLoad={() => setBgLoaded(true)}
        className="absolute inset-0 z-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
        style={{
          opacity: bgLoaded ? 1 : 0,
          filter: showForm
            ? 'blur(8px) brightness(0.6)'
            : 'blur(0px) brightness(0.95)',
          transform: showForm ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      <div className="relative z-10 w-full max-w-md mt-8">
        {!showForm ? (
          /* Pantalla de bienvenida inicial */
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl italic">
              {t('auth.login.title')}
            </h1>
            <p className="text-2xl text-white/90 mb-10 font-medium drop-shadow-lg text-balance">
              {t('auth.login.subtitle')}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-4 mx-auto px-10 py-5 bg-white text-brand-orange font-black rounded-[2rem] hover:bg-brand-orange hover:text-white transition-all shadow-2xl active:scale-95"
            >
              <span>{t('auth.login.cta')}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        ) : (
          /* Tarjeta de Login estilo "Clean Card" con la Casita Superior flotante */
          <div className="relative bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl px-8 pt-16 pb-10 animate-in slide-in-from-top-10 duration-500">
            {/* 🏠 Icono de Casita flotante (Reemplaza a la flecha) */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand-orange p-5 rounded-[2rem] shadow-xl border-4 border-white">
              <Home className="w-9 h-9 text-white" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-brand-coral uppercase tracking-tighter mb-2">
                {t('auth.login.formTitle', '¡Bienvenido!')}
              </h2>
              <p className="text-sm text-gray-500 font-medium text-balance px-2">
                {t(
                  'auth.login.formSubtitle',
                  'LittleNeighbors es tu comunidad de confianza. Ingresa tus credenciales para continuar.',
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-200 outline-none focus:border-brand-orange bg-transparent transition-colors text-gray-700"
                  placeholder={t('auth.login.emailPlaceholder')}
                  required
                />
              </div>

              {/* Input Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-200 outline-none focus:border-brand-orange bg-transparent transition-colors text-gray-700"
                  placeholder={t('auth.login.passwordPlaceholder')}
                  required
                />
              </div>

              {/* Enlace recuperar contraseña estilo la imagen */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-gray-500 hover:text-brand-orange text-xs font-bold transition-colors hover:underline"
                >
                  {t(
                    'auth.login.linkForgotPassword',
                    '¿Has olvidado tus credenciales?',
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-bold">
                  {error}
                </div>
              )}

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange text-white font-black py-4 rounded-xl shadow-lg hover:bg-brand-coral transition-all transform hover:-translate-y-0.5 uppercase tracking-wider text-sm mt-4"
              >
                {loading
                  ? t('auth.login.submitLoading')
                  : t('auth.login.submitIdle', 'Ingresar')}
              </button>

              {/* Enlaces inferiores de navegación secundaria */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-brand-orange font-bold text-xs hover:underline uppercase tracking-wider"
                >
                  {t('auth.login.linkRegister')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 font-bold text-xs uppercase tracking-widest"
                >
                  {t('auth.login.linkBack')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
