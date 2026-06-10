import { AlertCircle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'danger',
}) => {
  if (!isOpen) return null

  const colors = {
    danger: 'bg-red-500 hover:bg-red-600 border-red-200',
    warning: 'bg-orange-500 hover:bg-orange-600 border-orange-200',
    info: 'bg-blue-500 hover:bg-blue-600 border-blue-200',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con blur */}
      <div
        className="absolute inset-0 bg-[#2D2D2D]/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-t-8 border-red-500 p-8 transform animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-red-50 p-4 rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>

          <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">
            {title}
          </h3>
          <p className="text-gray-500 font-medium mb-8">{message}</p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-lg transition-all active:scale-95 ${colors[type]}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
