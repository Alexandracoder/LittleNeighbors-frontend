import {
  Edit,
  Trash2,
  Cake,
  Tag,
  Baby,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChildResponseDTO } from '../types'
import { childApi } from '../services/api'

interface ChildCardProps {
  // Cambiamos a 'child: ChildResponseDTO | null' para dar flexibilidad al padre
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
  const { t } = useTranslation()
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!child) return null

  const isPrenatal = child.lifeStage === 'PREGNANCY'

  const getDisplayAge = () => {
    if (isPrenatal) return 'Coming soon'
    if (child.age !== undefined && child.age !== null) {
      if (child.age === 0) return 'Newborn'
      return `${child.age} ${child.age === 1 ? 'year' : 'years'} old`
    }
    return 'New Neighbor'
  }

  const getTitle = () => {
    if (isPrenatal) return t('child.form.lifeStagePrenatal', 'Embaràs')
    if (child.gender === 'BOY') return t('child.form.genderBoy', 'Xiquet')
    if (child.gender === 'GIRL') return t('child.form.genderGirl', 'Xiqueta')
    return t('child.info.baby', 'Infant')
  }

  const handleMatchRequest = async () => {
    if (!myChildId) return
    setStatus('loading')
    try {
      await childApi.requestMatch(myChildId, child.id)
      setStatus('success')
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error sending request')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div
      className={`bg-white rounded-[3rem] shadow-xl p-8 transition-all border-b-[12px] hover:-translate-y-1 ${
        isPrenatal ? 'border-purple-400' : 'border-brand-orange'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-brand-dark mb-1 uppercase tracking-tighter">
            {getTitle()}
          </h3>
          <div className="flex items-center gap-2 text-gray-400">
            {isPrenatal ? (
              <Baby className="w-5 h-5 text-purple-400" />
            ) : (
              <Cake className="w-5 h-5 text-brand-orange" />
            )}
            <span className="text-sm font-black uppercase tracking-widest">
              {getDisplayAge()}
            </span>
          </div>
        </div>

        {!showMatchButton && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(child)}
              className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-brand-dark hover:text-white transition-all"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(child.id)}
              className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {child.interests && child.interests.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-300 text-[9px] font-black uppercase tracking-[0.2em]">
            <Tag
              className={`w-3 h-3 ${
                isPrenatal ? 'text-purple-300' : 'text-brand-orange/40'
              }`}
            />
            <span>{t('interestsLabel', 'Interessos')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {child.interests.map((interest, index) => (
              <span
                key={index}
                className="px-4 py-1.5 bg-gray-50 text-brand-dark text-[10px] font-black rounded-full border border-gray-100 uppercase tracking-tight"
              >
                {interest.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {showMatchButton && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          {status === 'idle' && (
            <button
              onClick={handleMatchRequest}
              className="w-full py-5 bg-brand-dark text-white font-black rounded-[2rem] hover:bg-brand-orange transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs shadow-lg"
            >
              <Send className="w-4 h-4" />{' '}
              {t('matchRequest', 'Connectar')}
            </button>
          )}
          {status === 'loading' && (
            <div className="py-4 text-center text-gray-400 font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
              <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />{' '}
              {t('loading')}
            </div>
          )}
          {status === 'success' && (
            <div className="py-4 text-center text-green-500 font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest animate-in zoom-in">
              <CheckCircle2 className="w-4 h-4" /> {t('save')}
            </div>
          )}
          {status === 'error' && (
            <div className="py-4 text-center text-red-500 font-black text-[10px] uppercase tracking-widest">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
