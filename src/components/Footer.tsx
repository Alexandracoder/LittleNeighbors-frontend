import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="w-full py-6 px-4 text-center">
      <p className="text-[11px] text-gray-400 font-medium tracking-wide">
        © {year} LittleNeighbors — {t('footer.allRightsReserved', 'Todos los derechos reservados')}
      </p>
      <p className="text-[10px] text-gray-300 font-medium mt-1">
        {t('footer.madeBy', 'Creada por Alexandra, fundadora y desarrolladora')}
      </p>
      <p className="text-[10px] text-gray-300 font-medium mt-2">
        <Link to="/about" className="hover:text-[#F28749] hover:underline">
          {t('footer.aboutLink', 'Quiénes somos · Contacto · Ubicación')}
        </Link>
        {' · '}
        <Link to="/privacy" className="hover:text-[#F28749] hover:underline">
          {t('footer.privacyLink', 'Privacidad')}
        </Link>
      </p>
    </footer>
  )
}
