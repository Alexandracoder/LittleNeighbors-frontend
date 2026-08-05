import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Users, MapPin, CalendarHeart } from 'lucide-react'
import api from '../services/api'

const PRIVACY_POLICY_VERSION = '1.0'
const GOAL = 20

export const QrLandingPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [barrio, setBarrio] = useState('')
  const [barrios, setBarrios] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [votosContador, setVotosContador] = useState(0)
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [consentGiven, setConsentGiven] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const fetchContador = async (nombreBarrio: string) => {
    try {
      const { data } = await api.get(
        `/public/pilot-lead/count?neighborhood=${encodeURIComponent(
          nombreBarrio,
        )}`,
      )
      setVotosContador(data.count ?? 0)
    } catch {
      // no bloquear la UI si falla el contador
    }
  }

  useEffect(() => {
    // Antes esta lista estaba hardcodeada aquí (y duplicada a mano en el
    // backend, en AdminController), así que cada barrio nuevo del piloto
    // había que añadirlo en dos sitios y era fácil olvidarse de uno.
    // Ahora se pide al backend, que es la única fuente de verdad
    // (com.alexandracoder.littleneighbors.qr.PilotBarrios).
    api
      .get('/public/pilot-lead/barrios')
      .then(({ data }) => setBarrios(data))
      .catch(() => {
        // Si falla, dejamos el desplegable vacío en vez de romper el
        // formulario entero; el usuario puede recargar la página.
        setBarrios([])
      })
  }, [])

  useEffect(() => {
    const barrioParam = searchParams.get('barrio')
    if (barrioParam) {
      const formatted =
        barrioParam.charAt(0).toUpperCase() + barrioParam.slice(1).toLowerCase()
      setBarrio(formatted)
      fetchContador(formatted)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentGiven) {
      setMensajeError('Debes aceptar la política de privacidad para continuar.')
      return
    }
    setLoading(true)
    setMensajeError(null)

    try {
      await api.post('/public/pilot-lead', {
        email,
        neighborhood: barrio,
        consentGiven: true,
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      })
      setSubmitted(true)
      setVotosContador(prev => prev + 1)
    } catch (err: any) {
      if (err.response?.status === 409) {
        setMensajeError('¡Esta familia ya ha votado por este barrio!')
        setSubmitted(true)
      } else if (err.response?.status === 429) {
        setMensajeError('Demasiados intentos. Por favor, espera unos minutos.')
      } else {
        setMensajeError(
          'No se pudo conectar con el servidor. Inténtalo de nuevo.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const porcentaje = Math.min(Math.round((votosContador / GOAL) * 100), 100)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF8F3]">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#2D2D2D] px-6 pt-8 pb-6 text-center">
          <div className="text-3xl mb-2">🏘️</div>
          <h1 className="text-white font-black text-xl uppercase tracking-tight">
            LittleNeighbors
          </h1>
          <p className="text-white/60 text-xs font-medium mt-1">
            La red de crianza de tu barrio
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Cómo funciona — antes no había ninguna explicación de la app
              antes de pedir el email; ahora la persona sabe qué está
              aceptando antes de dejar su correo. */}
          <div className="space-y-2.5">
            {[
              { icon: UserPlus, text: 'Te registras y verificas tu email' },
              { icon: Users, text: 'Creas el perfil de tu familia' },
              { icon: MapPin, text: 'Descubres familias cerca de ti' },
              { icon: CalendarHeart, text: 'Organizáis quedadas y eventos' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-orange-500" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-[#2D2D2D]">{text}</p>
              </div>
            ))}
          </div>

          {/* Barra de progreso */}
          {barrio && (
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-orange-600">
                  {barrio}
                </span>
                <span className="text-xs font-bold text-orange-400">
                  {votosContador}/{GOAL} familias
                </span>
              </div>
              <div className="w-full h-2.5 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <p className="text-[10px] text-orange-400 font-medium mt-2 text-center">
                {GOAL - votosContador > 0
                  ? `¡Faltan ${
                      GOAL - votosContador
                    } familias para activar el piloto!`
                  : '🎉 ¡Piloto activado!'}
              </p>
            </div>
          )}

          {/* Error */}
          {mensajeError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-600 font-bold text-center">
              {mensajeError}
            </div>
          )}

          {!submitted ? (
            <>
              <p className="text-sm text-[#2D2D2D] font-medium text-center leading-relaxed">
                Estamos abriendo la primera red de crianza verificada en{' '}
                <strong>{barrio || 'tu zona'}</strong>.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full p-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl text-sm font-bold outline-none transition-all"
                  />
                </div>

                {!searchParams.get('barrio') && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                      Barrio
                    </label>
                    <select
                      required
                      value={barrio}
                      onChange={e => {
                        setBarrio(e.target.value)
                        if (e.target.value) fetchContador(e.target.value)
                      }}
                      className="w-full p-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl text-sm font-bold outline-none transition-all"
                    >
                      <option value="">Selecciona tu barrio...</option>
                      {barrios.map(b => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Consentimiento RGPD — obligatorio */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={e => setConsentGiven(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-orange-500 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-500 leading-relaxed">
                      He leído y acepto la{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacy(true)}
                        className="text-orange-500 font-bold underline underline-offset-2"
                      >
                        política de privacidad
                      </button>
                      . Entiendo que mi email se usará únicamente para
                      contactarme sobre el piloto de LittleNeighbors y será
                      eliminado o anonimizado en 12 meses si no completo el
                      registro.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !consentGiven}
                  className="w-full py-4 bg-[#2D2D2D] text-white font-black rounded-[1.5rem] text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Enviando...</span>
                  ) : (
                    `¡Voto por ${barrio || 'mi barrio'}!`
                  )}
                </button>
              </form>

              {/* Nota RGPD pie */}
              <p className="text-[10px] text-gray-300 text-center leading-relaxed">
                Tus datos se tratan conforme al RGPD (UE) 2016/679.{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  className="underline"
                >
                  Más información
                </button>
              </p>
            </>
          ) : (
            <div className="py-8 text-center space-y-3">
              {mensajeError ? (
                <p className="text-sm font-bold text-gray-500">
                  {mensajeError}
                </p>
              ) : (
                <>
                  <div className="text-5xl">🎉</div>
                  <h2 className="font-black text-[#2D2D2D] text-lg uppercase tracking-tight">
                    ¡Registrado!
                  </h2>
                  <p className="text-sm text-gray-400 font-medium">
                    Te avisaremos cuando el piloto en {barrio} esté listo.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal política de privacidad */}
      {showPrivacy && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPrivacy(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-black text-sm uppercase tracking-widest text-[#2D2D2D] mb-4">
              Política de Privacidad
            </h3>
            <div className="text-xs text-gray-500 space-y-3 leading-relaxed">
              <p>
                <strong className="text-gray-700">Responsable:</strong>{' '}
                LittleNeighbors (Murry Rojas). Contacto:
                privacy@littleneighbors.es
              </p>
              <p>
                <strong className="text-gray-700">Finalidad:</strong> Gestionar
                tu inscripción al piloto vecinal y contactarte cuando tu barrio
                alcance el objetivo de familias.
              </p>
              <p>
                <strong className="text-gray-700">Base legal:</strong> Tu
                consentimiento explícito (Art. 6.1.a RGPD).
              </p>
              <p>
                <strong className="text-gray-700">Conservación:</strong> Tu
                email se conservará durante 12 meses. Si no completas el
                registro en la app, será anonimizado automáticamente.
              </p>
              <p>
                <strong className="text-gray-700">Destinatarios:</strong> No
                cedemos tus datos a terceros. El servicio de email de
                notificación (Brevo) actúa como encargado del tratamiento bajo
                contrato.
              </p>
              <p>
                <strong className="text-gray-700">Tus derechos:</strong> Puedes
                ejercer tus derechos de acceso, rectificación, supresión,
                oposición, portabilidad y limitación escribiendo a
                privacy@littleneighbors.es. Tienes derecho a presentar reclamación
                ante la AEPD (aepd.es).
              </p>
              <p>
                <strong className="text-gray-700">Versión:</strong>{' '}
                {PRIVACY_POLICY_VERSION} — junio 2026
              </p>
            </div>
            <button
              onClick={() => setShowPrivacy(false)}
              className="w-full mt-5 py-3 bg-[#2D2D2D] text-white font-black rounded-2xl text-xs uppercase tracking-widest"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}