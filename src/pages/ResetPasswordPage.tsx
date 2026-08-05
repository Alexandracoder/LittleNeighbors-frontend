import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { Lock, Loader2, CheckCircle, XCircle } from 'lucide-react'
import bgImage from '../assets/welcome-on-board.png'

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError(t('resetPassword.errorMatch', 'Las contraseñas no coinciden'))
      return
    }
    if (password.length < 8) {
      setError(t('resetPassword.errorLength', 'Mínimo 8 caracteres'))
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      // El backend a veces responde con un string plano (errores 400 como
      // token inválido/expirado) y a veces con el objeto JSON
      // {message, timestamp, status} del GlobalExceptionHandler (errores
      // 500). Antes esto último se guardaba tal cual en el estado y React
      // intentaba renderizar el objeto directamente como texto, lo cual
      // rompe toda la página (Error #31: objects are not valid as a React
      // child).
      const data = err.response?.data
      const message =
        typeof data === 'string'
          ? data
          : data?.message ||
            t(
              'resetPassword.errorExpired',
              'El enlace ha expirado o no es válido',
            )
      setError(message)
    } finally {
      setLoading(false)
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-black text-[#2D2D2D] uppercase italic tracking-tight text-center">
            {t('resetPassword.title', 'Nueva contraseña')}
          </h1>
          <p className="text-sm text-gray-400 text-center mt-1 font-medium">
            {t('resetPassword.subtitle', 'Elige una contraseña segura')}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="font-black text-green-700 text-center uppercase tracking-wide text-sm">
              {t(
                'resetPassword.success',
                '¡Contraseña actualizada! Redirigiendo...',
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-2">
                {t('resetPassword.newPassword', 'Nueva contraseña')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-2">
                {t('resetPassword.confirmPassword', 'Confirmar contraseña')}
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold outline-none transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2D2D2D] text-white font-black rounded-[1.5rem] hover:bg-black flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-[0.98] mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('resetPassword.submit', 'Actualizar contraseña')
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
