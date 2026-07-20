import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { MailCheck, Loader2, CheckCircle, XCircle, Send } from 'lucide-react'
import bgImage from '../assets/welcome-on-board.png'

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [error, setError] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error')
        setError(t('verifyEmail.errorMissing', 'Enlace de verificación no válido'))
        return
      }
      try {
        await api.post('/auth/verify-email', { token })
        setStatus('success')
        setTimeout(() => navigate('/login'), 3000)
      } catch (err: any) {
        setStatus('error')
        setError(
          err.response?.data ||
            t(
              'verifyEmail.errorExpired',
              'El enlace ha expirado o no es válido',
            ),
        )
      }
    }
    verify()
  }, [token])

  const handleResend = async () => {
    if (!resendEmail.trim()) return
    setResending(true)
    try {
      await api.post('/auth/resend-verification', { email: resendEmail.trim() })
      setResendSent(true)
      toast.success(
        t(
          'verifyEmail.resendSuccess',
          'Si el correo existe, te hemos enviado un nuevo enlace.',
        ),
      )
    } catch (err) {
      console.error('Error resending verification email:', err)
      toast.error(
        t('verifyEmail.resendError', 'No se pudo reenviar. Inténtalo de nuevo.'),
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <MailCheck className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-black text-[#2D2D2D] uppercase italic tracking-tight text-center">
            {t('verifyEmail.title', 'Verificando tu email')}
          </h1>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
            <p className="text-sm text-gray-400 text-center font-medium">
              {t('verifyEmail.loading', 'Un momento, por favor...')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="font-black text-green-700 text-center uppercase tracking-wide text-sm">
              {t(
                'verifyEmail.success',
                '¡Email verificado! Ya podemos revisar tu perfil.',
              )}
            </p>
            <p className="text-xs text-gray-400 text-center">
              {t('verifyEmail.redirecting', 'Redirigiendo al login...')}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-6 w-full">
            <XCircle className="w-16 h-16 text-red-500" />
            <p className="text-sm text-red-600 font-bold text-center">
              {error}
            </p>

            {!resendSent ? (
              <div className="w-full flex flex-col gap-3 mt-2">
                <p className="text-xs text-gray-400 text-center">
                  {t(
                    'verifyEmail.resendPrompt',
                    '¿El enlace ha caducado? Pide uno nuevo:',
                  )}
                </p>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                  placeholder={t(
                    'verifyEmail.resendPlaceholder',
                    'Tu correo electrónico',
                  )}
                  className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-medium text-sm outline-none"
                />
                <button
                  onClick={handleResend}
                  disabled={resending || !resendEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#F28749] hover:bg-[#e0763a] disabled:opacity-50 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all"
                >
                  <Send size={14} />
                  {resending
                    ? t('verifyEmail.resending', 'Enviando...')
                    : t('verifyEmail.resendButton', 'Reenviar enlace')}
                </button>
              </div>
            ) : (
              <p className="text-xs text-green-600 font-bold text-center">
                {t(
                  'verifyEmail.resendSuccess',
                  'Si el correo existe, te hemos enviado un nuevo enlace.',
                )}
              </p>
            )}

            <Link
              to="/login"
              className="text-xs font-black uppercase tracking-widest text-[#F28749] hover:underline mt-2"
            >
              {t('verifyEmail.backToLogin', 'Volver al login')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage
