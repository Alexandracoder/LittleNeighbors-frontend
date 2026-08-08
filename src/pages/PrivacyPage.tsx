import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const PRIVACY_POLICY_VERSION = '1.0'

export default function PrivacyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-[#FDF8F3] py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl p-6 md:p-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#F28749] font-bold text-sm mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back', 'Volver')}
        </button>

        <h1 className="text-2xl md:text-3xl font-black text-[#333D47] mb-2">
          {t('privacy.title', 'Política de privacidad')}
        </h1>
        <p className="text-xs text-gray-400 font-mono mb-8">
          {t('privacy.version', 'Versión')} {PRIVACY_POLICY_VERSION} —{' '}
          {t('privacy.lastUpdated', 'junio 2026')}
        </p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-black text-[#333D47] mb-2">
              {t('privacy.whoTitle', '¿Quién trata tus datos?')}
            </h2>
            <p>
              {t(
                'privacy.whoBody',
                'LittleNeighbors trata los datos que nos facilitas al registrarte, crear tu perfil familiar y el de tus hijos, para poder ofrecerte el servicio de conexión con familias de tu barrio.',
              )}
            </p>
          </section>

          <section>
            <h2 className="font-black text-[#333D47] mb-2">
              {t('privacy.whatTitle', '¿Qué datos tratamos?')}
            </h2>
            <p>
              {t(
                'privacy.whatBody',
                'Datos de contacto (nombre, email), datos del perfil familiar (barrio, foto, descripción) y datos de los niños que añadas (nombre, edad o fecha de nacimiento, intereses). Estos últimos los introduces tú como responsable legal, y se usan exclusivamente para las funciones de la app (encontrar otras familias, organizar quedadas).',
              )}
            </p>
          </section>

          <section>
            <h2 className="font-black text-[#333D47] mb-2">
              {t('privacy.baseTitle', 'Base legal')}
            </h2>
            <p>
              {t(
                'privacy.baseBody',
                'Tu consentimiento explícito (Art. 6.1.a RGPD), otorgado al registrarte. Puedes retirarlo en cualquier momento solicitando la baja de tu cuenta.',
              )}
            </p>
          </section>

          <section>
            <h2 className="font-black text-[#333D47] mb-2">
              {t('privacy.rightsTitle', 'Tus derechos')}
            </h2>
            <p>
              {t(
                'privacy.rightsBody',
                'Puedes acceder, rectificar, eliminar tus datos o los de tus hijos, u oponerte a su tratamiento, escribiendo a privacy@littleneighbors.com.',
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
