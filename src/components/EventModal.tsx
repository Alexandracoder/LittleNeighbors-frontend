import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-[3rem] w-full max-w-lg shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 text-brand-dark/40 hover:text-brand-coral hover:bg-brand-coral/10 transition-all group"
          aria-label={t('common.back')}
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="mt-4">{children}</div>

        <button
          onClick={onClose}
          className="mt-8 w-full py-4 bg-gray-100 text-brand-dark font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-200 transition-colors"
        >
          {t('back')}
        </button>
      </div>
    </div>
  )
}
