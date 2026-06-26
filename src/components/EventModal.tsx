import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const EventModal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) => {
  const { t } = useTranslation()

  if (!isOpen) return null


  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2D2D2D]/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[3rem] w-full max-w-lg shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative border border-white animate-in zoom-in-95 duration-300">
        {/* Botón de cierre circular e icónico */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-100/50 hover:bg-orange-100 text-gray-400 hover:text-[#F28749] rounded-full transition-all group"
          aria-label={t('common.close', 'Cerrar')}
        >
          <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
        </button>

        {/* Contenido del formulario */}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}
