import { useTranslation } from 'react-i18next'

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
    </footer>
  )
}
