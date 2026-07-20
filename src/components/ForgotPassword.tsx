import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import loginBg from '../assets/playing-together.png'

export default function ForgotPassword() {
  const { t, ready } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!ready) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess(true)
    } catch (err) {
      console.error(err)
      // Antes no había ningún aviso aquí: si la petición fallaba (o
      // colgaba hasta hacer timeout), el botón simplemente volvía a
      // estar disponible sin explicar nada.
      toast.error(
        t(
          'auth.forgot.error',
          'No se pudo procesar la solicitud. Inténtalo de nuevo.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center blur-[8px] brightness-[0.6] scale-110"
        style={{ backgroundImage: `url(${loginBg})` }}
      />

      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl px-8 pt-16 pb-10">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand-coral p-5 rounded-[2rem] shadow-xl border-4 border-white">
          <Mail className="w-9 h-9 text-white" />
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="text-center">
            <h2 className="text-3xl font-black text-brand-coral uppercase tracking-tighter mb-4">
              {t('auth.forgot.title')}
            </h2>
            <p className="text-sm text-gray-500 mb-8 px-2">
              {t('auth.forgot.subtitle')}
            </p>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-4 mb-6 border-b-2 border-gray-200 outline-none focus:border-brand-orange bg-transparent transition-colors text-gray-700"
              placeholder={t('auth.login.emailPlaceholder')}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-xl shadow-lg hover:bg-brand-coral transition-all uppercase tracking-wider"
            >
              {loading ? (
                '...'
              ) : (
                <>
                  <Send className="inline mr-2 w-4 h-4" />{' '}
                  {t('auth.forgot.submit')}
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center animate-in fade-in duration-500">
            <h2 className="text-2xl font-black text-green-600 mb-4">
              {t('auth.forgot.successTitle')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('auth.forgot.successSubtitle')}
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-6 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-brand-orange transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> {t('auth.login.linkBack')}
        </button>
      </div>
    </div>
  )
}
