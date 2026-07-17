import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, ArrowRight } from 'lucide-react'
import { authApi } from '../services/api'
import { useTranslation } from 'react-i18next'
import registerBg from '../assets/moving.png'

export default function Register() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Extraer el token de la URL: ?invite=TOKEN
  const inviteToken = searchParams.get('invite')

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    inviteToken: inviteToken || '',
  })
  const [consentGiven, setConsentGiven] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    if (inviteToken) {
      setShowForm(true)
    }
  }, [inviteToken])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!consentGiven) {
      setError(
        t(
          'privacy.consentRequired',
          'Debes aceptar la política de privacidad para continuar.',
        ),
      )
      return
    }

    setLoading(true)

    try {
      await authApi.register({ ...formData, consentGiven })
      // Antes se intentaba hacer login automático justo aquí, pero ahora
      // el email tiene que verificarse primero (ver VerifyEmailPage), así
      // que ese login fallaría siempre para una cuenta recién creada.
      // Mostramos la pantalla de "revisa tu correo" en su lugar.
      setRegistered(true)
    } catch (err: any) {
      const fieldErrors = err.response?.data?.errors
      const firstFieldError =
        fieldErrors && typeof fieldErrors === 'object'
          ? (Object.values(fieldErrors)[0] as string | undefined)
          : undefined

      setError(
        firstFieldError ||
          err.response?.data?.message ||
          t('auth.register.errorDefault'),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* SELECTOR DE IDIOMAS */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        {['en', 'es', 'va'].map(lng => (
          <button
            key={lng}
            onClick={() => i18n.changeLanguage(lng)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2 ${
              i18n.language === lng
                ? 'bg-[#F28749] border-[#F28749] text-white shadow-lg scale-110'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/30 backdrop-blur-md'
            }`}
          >
            {lng.toUpperCase()}
          </button>
        ))}
      </div>

      {/* FONDO */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${registerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: showForm
            ? 'brightness(0.7) blur(4px)'
            : 'brightness(0.95) blur(0px)',
          transform: showForm ? 'scale(1.05)' : 'scale(1)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {!showForm ? (
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl italic tracking-tighter">
              {t('auth.register.title')}
            </h1>
            <p className="text-2xl text-white/90 mb-10 font-medium drop-shadow-lg text-balance">
              {t('auth.register.subtitle')}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-4 mx-auto px-10 py-5 bg-white text-[#F28749] font-black rounded-[2rem] hover:bg-[#F28749] hover:text-white transition-all shadow-2xl active:scale-95"
            >
              <span>{t('auth.register.cta')}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        ) : registered ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border-t-[10px] border-[#F28749] animate-in zoom-in duration-500 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-[#F28749] p-4 rounded-3xl shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-[#333D47] mb-4 uppercase tracking-tighter">
              {t('auth.register.checkEmailTitle', '¡Revisa tu correo!')}
            </h2>
            <p className="text-gray-500 font-medium mb-8">
              {t(
                'auth.register.checkEmailBody',
                'Te hemos enviado un enlace para verificar tu cuenta. Ábrelo para poder entrar en LittleNeighbors.',
              )}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="text-[#F28749] font-bold text-sm hover:underline"
            >
              {t('auth.register.linkLogin')}
            </button>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border-t-[10px] border-[#F28749] animate-in slide-in-from-top-10 duration-500">
            <div className="flex justify-center mb-6">
              <div className="bg-[#F28749] p-4 rounded-3xl shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-center text-[#333D47] mb-8 uppercase tracking-tighter">
              {t('auth.register.formTitle')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="firstName"
                  type="text"
                  placeholder={t('auth.register.firstNamePlaceholder')}
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#F28749] bg-white/50"
                  required
                />
                <input
                  name="lastName"
                  type="text"
                  placeholder={t('auth.register.lastNamePlaceholder')}
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#F28749] bg-white/50"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F28749] w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#F28749] bg-white/50"
                  placeholder={t('auth.register.emailPlaceholder')}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F28749] w-5 h-5" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#F28749] bg-white/50"
                  placeholder={t('auth.register.passwordPlaceholder')}
                  minLength={8}
                  title={t(
                    'auth.register.passwordMinLength',
                    'Debe tener al menos 8 caracteres',
                  )}
                  required
                />
              </div>

              <label className="flex items-start gap-3 text-xs text-gray-600 px-1">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={e => setConsentGiven(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#F28749] shrink-0"
                  required
                />
                <span>
                  {t('privacy.consentLabel', 'He leído y acepto la')}{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="text-[#F28749] font-bold hover:underline"
                  >
                    {t('privacy.consentLinkText', 'política de privacidad')}
                  </Link>
                </span>
              </label>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !consentGiven}
                className="w-full bg-[#F28749] text-white font-black py-5 rounded-2xl shadow-xl hover:opacity-90 transition-all transform hover:-translate-y-1 mt-4 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading
                  ? t('auth.register.submitLoading')
                  : t('auth.register.submitIdle')}
              </button>

              <div className="flex flex-col gap-3 mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#F28749] font-bold text-sm hover:underline"
                >
                  {t('auth.register.linkLogin')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 font-medium text-xs uppercase tracking-widest mt-2"
                >
                  {t('auth.register.linkBack')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
