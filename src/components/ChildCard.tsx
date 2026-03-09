import {
  Edit,
  Trash2,
  Cake,
  Tag,
  Baby,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import type { ChildResponseDTO } from '../types'
import { childApi } from '../services/api'

interface ChildCardProps {
  child: ChildResponseDTO
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
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isPrenatal = child.lifeStage === 'PRENATAL'

  const getDisplayAge = () => {
    if (isPrenatal) return 'Coming soon'
    if (child.age && child.age > 0)
      return `${child.age} ${child.age === 1 ? 'year' : 'years'} old`
    if (!child.birthDate) return 'Newborn'
    const birth = new Date(child.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return `${age} ${age === 1 ? 'year' : 'years'} old`
  }

  const getTitle = () => {
    if (isPrenatal) return 'Expecting'
    if (child.gender === 'BOY') return 'Little Boy'
    if (child.gender === 'GIRL') return 'Little Girl'
    return 'Little Neighbor'
  }

  const handleMatchRequest = async () => {
    if (!myChildId) return
    setStatus('loading')
    try {
      await childApi.requestMatch(myChildId, child.id)
      setStatus('success')
    } catch (err: any) {
      setErrorMessage(err.message)
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
      {/* CABECERA RESTAURADA */}
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

        {!showMatchButton && (
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
        )}
      </div>

      {/* INTERESES RESTAURADOS */}
      {child.interests && child.interests.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <Tag
              className={`w-4 h-4 ${
                isPrenatal ? 'text-purple-300' : 'text-orange-300'
              }`}
            />
            <span>Interests</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {child.interests.map((interest: any, index: number) => (
              <span
                key={index}
                className="px-4 py-1.5 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-full border border-gray-100"
              >
                {typeof interest === 'string' ? interest : interest.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* BOTÓN DE MATCH */}
      {showMatchButton && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          {status === 'idle' && (
            <button
              onClick={handleMatchRequest}
              className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" /> REQUEST PLAYDATE
            </button>
          )}
          {status === 'loading' && (
            <div className="text-center text-gray-400 font-bold flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" /> SENDING...
            </div>
          )}
          {status === 'success' && (
            <div className="text-center text-green-500 font-black flex items-center justify-center gap-2">
              <CheckCircle2 /> REQUEST SENT
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
