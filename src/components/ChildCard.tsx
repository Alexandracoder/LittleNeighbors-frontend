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
import { useTranslation } from 'react-i18next'
import type { ChildResponseDTO } from '../types'
import { childApi } from '../services/api'


import avatar1 from '../assets/Avatar1.jpg'
import avatar2 from '../assets/Avatar2.jpg'
import avatar3 from '../assets/Avatar3.jpg'
import avatar4 from '../assets/Avatar4.jpg'
import i18n from '../i18n'


const localAvatars = [avatar1, avatar2, avatar3, avatar4]

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
  const { t } = useTranslation()
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!child) return null

  const isPrenatal = child.lifeStage === 'PREGNANCY'


  const avatarIndex = child.id ? child.id % localAvatars.length : 0
  const avatarUrl = localAvatars[avatarIndex]

  const handleGoToChat = () => {
    if (child.familyId) {
      navigate(`/messages?with=${child.familyId}`)
    } else {
      console.error(
        t('children.card.errorNoFamilyId') ||
          'No se encontró el ID de usuario de la familia',
      )
    }
  }

  const getDisplayAge = () => {
    if (isPrenatal) return t('children.card.agePrenatal')
    if (child.age !== undefined && child.age !== null) {
      if (child.age === 0) return t('children.card.ageNewborn')
      const suffix =
        child.age === 1
          ? t('children.card.ageSuffix_one')
          : t('children.card.ageSuffix_other')
      return `${child.age} ${suffix}`
    }
    return t('children.card.ageDefault')
  }
const getTitle = () => {
  if (!child.nickname) return t('children.card.titleDefault')


  const parts = child.nickname.split(' ')

  if (parts.length === 2) {
    const [adj, noun] = parts

    const adjKey = adj.toLowerCase()
    const nounKey = noun.toLowerCase()

    const hasAdj =
      i18n.hasResourceBundle(i18n.language, 'translation') &&
      i18n.exists(`nicknames.adjectives.${adjKey}`)
    const hasNoun =
      i18n.hasResourceBundle(i18n.language, 'translation') &&
      i18n.exists(`nicknames.nouns.${nounKey}`)

    if (hasAdj && hasNoun) {
      const translatedAdj = t(`nicknames.adjectives.${adjKey}`)
      const translatedNoun = t(`nicknames.nouns.${nounKey}`)

      return `${
        translatedAdj.charAt(0).toUpperCase() + translatedAdj.slice(1)
      } ${translatedNoun.charAt(0).toUpperCase() + translatedNoun.slice(1)}`
    }
  }

  return child.nickname
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
      className={`relative bg-white rounded-[3rem] shadow-xl p-8 transition-all border-b-8 hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${
        isPrenatal ? 'border-purple-400' : 'border-orange-400'
      }`}
    >
      <div className="absolute top-6 right-6 flex gap-2 z-20">
        {!showMatchButton ? (
          <>
            <button
              onClick={e => {
                e.stopPropagation()
                onEdit(child)
              }}
              className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={e => {
                e.stopPropagation()
                onDelete(child.id)
              }}
              className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={e => {
              e.stopPropagation()
              handleGoToChat()
            }}
            className="p-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-[#F28749] hover:text-white transition-all shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      <div
        onClick={() => navigate(`/child/${child.id}`)}
        className="flex flex-col items-center text-center cursor-pointer group mb-6"
      >
        <div className="relative w-28 h-28 mb-4">
          <div className="absolute inset-0 bg-gray-100 rounded-full group-hover:scale-110 group-hover:bg-orange-50 transition-all duration-500"></div>
          <img
            src={avatarUrl}
            alt={child.nickname || 'Avatar'}
            className="relative z-10 w-full h-full rounded-full object-cover border-4 border-white shadow-md bg-white"
          />
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-[#F28749] transition-colors leading-none truncate max-w-[220px]">
            {getTitle()}
          </h3>
          <div className="flex items-center justify-center gap-1.5 text-gray-400 font-bold uppercase text-[11px] tracking-widest">
            {isPrenatal ? (
              <Baby className="w-3 h-3" />
            ) : (
              <Cake className="w-3 h-3" />
            )}
            <span>{getDisplayAge()}</span>
          </div>
        </div>
      </div>

      {child.description && (
        <div className="mb-6 px-4 py-3 bg-gray-50 rounded-2xl border-l-4 border-orange-400 italic">
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
            "{child.description}"
          </p>
        </div>
      )}

      <div
        onClick={() => navigate(`/child/${child.id}`)}
        className="cursor-pointer space-y-3 mb-2"
      >
        {child.interests && child.interests.length > 0 && (
          <>
            <div className="flex items-center justify-center gap-2 text-gray-300 text-[9px] font-black uppercase tracking-[0.2em]">
              <Tag className="w-3 h-3" />
              <span>{t('children.card.interestsLabel')}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {child.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full border border-gray-100 uppercase"
                >
                  {t(`interests.${interest.name.toLowerCase()}`, {
                    defaultValue: interest.name,
                  })}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {showMatchButton && (
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3 relative z-10">
          {status === 'idle' && (
            <button
              onClick={handleMatchRequest}
              className="w-full py-3.5 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> {t('children.card.requestPlaydate')}
            </button>
          )}
          {status === 'loading' && (
            <div className="py-3.5 text-center text-gray-400 font-bold flex items-center justify-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" />{' '}
              {t('children.card.sending')}
            </div>
          )}
          {status === 'success' && (
            <div className="py-3.5 text-center text-green-500 font-black flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />{' '}
              {t('children.card.requestSent')}
            </div>
          )}
          {status === 'error' && (
            <div className="text-[10px] text-red-500 text-center font-bold">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
