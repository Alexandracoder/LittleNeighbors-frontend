import {
  Edit,
  Trash2,
  Cake,
  Tag,
  Baby,
  Send,
  Loader2,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next' // 1. Importar hook
import type { ChildResponseDTO } from '../types'
import { childApi } from '../services/api'

interface ChildCardProps {
  child: ChildResponseDTO | null
  onEdit: (child: ChildResponseDTO) => void
  onDelete: (id: number) => void
  showMatchButton?: boolean
  myChildId?: number
}

export default function ChildCard({
  child,
  onEdit,
  onDelete,
  showMatchButton = false,
  myChildId,
}: ChildCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation() // 2. Inicializar t
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!child) return null

  const isPrenatal = child.lifeStage === 'PREGNANCY'

  const handleGoToChat = () => {
    if (child.familyId) {
      navigate(`/messages?with=${child.familyId}`)
    } else {
      console.error('No se encontró el ID de usuario de la familia')
    }
  }

  // 3. Edad dinámica con tu JSON
  const getDisplayAge = () => {
    if (isPrenatal) return t('children.card.agePrenatal')
    if (child.age !== undefined && child.age !== null) {
      if (child.age === 0) return t('children.card.ageNewborn')

      // Lógica para año/años según tu JSON
      const suffix =
        child.age === 1
          ? t('children.card.ageSuffix_one')
          : t('children.card.ageSuffix_other')

      return `${child.age} ${suffix}`
    }
    return t('children.card.ageDefault')
  }

  // 4. Títulos dinámicos con tu JSON
  const getTitle = () => {
    if (isPrenatal) return t('children.card.titlePrenatal')
    if (child.gender === 'BOY') return t('children.card.titleBoy')
    if (child.gender === 'GIRL') return t('children.card.titleGirl')
    return t('children.card.titleDefault')
  }

  const handleMatchRequest = async () => {
    if (!myChildId) return
    setStatus('loading')
    try {
      await childApi.requestMatch(myChildId, child.id)
      setStatus('success')
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || t('common.error'))
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div
      className={`bg-white rounded-[2.5rem] shadow-xl p-8 transition-all border-b-8 ${
        isPrenatal ? 'border-purple-400' : 'border-orange-400'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-gray-900 mb-1">
            {getTitle()}
          </h3>
          <div className="flex items-center gap-2 text-gray-500">
            {isPrenatal ? (
              <Baby className="w-5 h-5 text-purple-400" />
            ) : (
              <Cake className="w-5 h-5 text-orange-400" />
            )}
            <span className="text-lg font-bold">{getDisplayAge()}</span>
          </div>
        </div>

        {!showMatchButton ? (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(child)}
              className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(child.id)}
              className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoToChat}
            className="p-4 bg-orange-100 text-orange-600 rounded-2xl hover:bg-[#F28749] hover:text-white transition-all shadow-sm group"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {child.interests && child.interests.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <Tag
              className={`w-4 h-4 ${
                isPrenatal ? 'text-purple-300' : 'text-orange-300'
              }`}
            />
            <span>{t('children.card.interestsLabel')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {child.interests.map((interest, index) => (
              <span
                key={index}
                className="px-4 py-1.5 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-full border border-gray-100"
              >
                {/* Traducción dinámica de intereses */}
                {t(`interests.${interest.name.toLowerCase()}`, {
                  defaultValue: interest.name,
                })}
              </span>
            ))}
          </div>
        </div>
      )}

      {showMatchButton && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
          {status === 'idle' && (
            <button
              onClick={handleMatchRequest}
              className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" /> {t('children.card.requestPlaydate')}
            </button>
          )}
          {status === 'loading' && (
            <div className="text-center text-gray-400 font-bold flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" /> {t('children.card.sending')}
            </div>
          )}
          {status === 'success' && (
            <div className="text-center text-green-500 font-black flex items-center justify-center gap-2">
              <CheckCircle2 /> {t('children.card.requestSent')}
            </div>
          )}
          {status === 'error' && (
            <div className="text-center text-red-500 font-bold text-xs">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
