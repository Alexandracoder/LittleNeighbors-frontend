import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function AboutPage() {
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

        <h1 className="text-2xl md:text-3xl font-black text-[#333D47] mb-8">
          {t('about.title', 'Sobre LittleNeighbors')}
        </h1>

        <div className="space-y-10 text-sm text-gray-700 leading-relaxed">
          {/* Quiénes somos */}
          <section>
            <h2 className="font-black text-[#333D47] mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#F28749]" />
              {t('about.whoTitle', 'Quiénes somos')}
            </h2>
            <p>
              {t(
                'about.whoBody',
                'LittleNeighbors nace en Valencia con una idea sencilla: que las familias de un mismo barrio puedan encontrarse, conocerse y apoyarse entre sí. Somos un proyecto pequeño e independiente, hecho pensando en la vida real de los barrios donde se cría a los niños.',
              )}
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="font-black text-[#333D47] mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F28749]" />
              {t('about.contactTitle', 'Contacto')}
            </h2>
            <p className="mb-2">
              {t(
                'about.contactBody',
                '¿Tienes dudas, sugerencias o quieres hablar con nosotros? Escríbenos, respondemos personalmente.',
              )}
            </p>
            <a
              href="mailto:contacto@littleneighbors.es"
              className="inline-block font-bold text-[#F28749] hover:underline"
            >
              contacto@littleneighbors.es
            </a>
          </section>

          {/* Ubicación */}
          <section>
            <h2 className="font-black text-[#333D47] mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F28749]" />
              {t('about.locationTitle', 'Dónde estamos')}
            </h2>
            <p>
              {t(
                'about.locationBody',
                'Somos un proyecto de Valencia, España, actualmente en fase piloto en varios barrios de la ciudad: Benimaclet, Ruzafa, Arrancapins, Cabañal, Velluters, Nou Moles, El Carmen, Patraix, Campanar y La Xerea.',
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
