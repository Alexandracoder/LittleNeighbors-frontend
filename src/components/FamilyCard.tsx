import {
  User,
  Baby,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  MapPin,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FamilyResponseDTO, InterestResponseDTO } from '../types'
import matchService from '../services/matchService'

interface FamilyCardProps {
  family: FamilyResponseDTO
  myChildId: number | undefined
  myInterestIds?: number[]
}

const STATUS_STYLES = {
  PREGNANT: {
    label: 'Esperando',
    color: 'text-pink-500 bg-pink-50',
    icon: '🤰',
    border: 'hover:border-pink-200',
  },
  NEW_PARENTS: {
    label: 'Recién Nacidos',
    color: 'text-blue-500 bg-blue-50',
    icon: '🍼',
    border: 'hover:border-blue-200',
  },
  ESTABLISHED_FAMILY: {
    label: 'Familia',
    color: 'text-green-500 bg-green-50',
    icon: '🏃‍♂️',
    border: 'hover:border-green-200',
  },
  SURPRISE: {
    label: '¡Sorpresa!',
    color: 'text-purple-600 bg-purple-50 font-bold italic',
    icon: '✨',
    border: 'hover:border-purple-300',
  },
}

export default function FamilyCard({
  family,
  myChildId,
  myInterestIds = [],
}: FamilyCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isConnecting, setIsConnecting] = useState(false)
  const [matchStatus, setMatchStatus] = useState<
    Record<number, 'idle' | 'loading' | 'success'>
  >({})

  const statusInfo =
    STATUS_STYLES[family.status as keyof typeof STATUS_STYLES] ||
    STATUS_STYLES.SURPRISE

  const hasActiveMatch = useMemo(
    () => Object.values(matchStatus).includes('success'),
    [matchStatus],
  )

  const childrenInterests = useMemo(() => {
    const all: InterestResponseDTO[] = family.children.flatMap(
      c => c.interests || [],
    )
    const interestMap = new Map<number, InterestResponseDTO>(
      all.map(item => [item.id, item]),
    )
    return Array.from(interestMap.values())
  }, [family.children])

  // Función principal: Romper el hielo
  const handleBreakTheIce = async (targetChildId: number) => {
    if (typeof myChildId !== 'number') {
      console.warn('No tienes un childId seleccionado (emisor)')
      return
    }

    try {
      setIsConnecting(true)
      // Pasamos emisor y receptor
      const newMatch = await matchService.requestMatch(myChildId, targetChildId)

      if (newMatch && newMatch.id) {
        setMatchStatus(prev => ({ ...prev, [targetChildId]: 'success' }))
        navigate(`/chat/${newMatch.id}`)
      }
    } catch (error) {
      console.error('Error breaking the ice:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div
      className={`bg-white rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent ${statusInfo.border} flex flex-col h-full group`}
    >
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-4 rounded-2xl transition-all duration-500 ${
              statusInfo.color.includes('purple')
                ? 'bg-purple-100 group-hover:bg-purple-600'
                : 'bg-[#FFF5F0] group-hover:bg-[#FF8A5C]'
            }`}
          >
            {family.status === 'SURPRISE' ? (
              <Sparkles
                className={`w-8 h-8 ${statusInfo.color} group-hover:text-white`}
              />
            ) : (
              <User
                className={`w-8 h-8 ${statusInfo.color} group-hover:text-white`}
              />
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusInfo.color}`}
            >
              {statusInfo.icon} {statusInfo.label}
            </span>
            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase">
              <MapPin className="w-3 h-3 text-[#FF8A5C]" />
              {family.neighborhood?.name || 'Nearby'}
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-black text-[#2D2D2D] tracking-tight mb-2 uppercase italic">
          The {family.familyName}s
        </h3>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 min-h-[40px]">
          {family.description || 'Looking for new friends!'}
        </p>
      </div>

      {/* Children List */}
      <div className="px-8 py-4 flex-1">
        {family.children.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              <Baby className="w-4 h-4 text-[#FF8A5C]" />
              Potential Playmates
            </div>
            <div className="space-y-3">
              {family.children.map(child => (
                <div
                  key={`child-${child.id}`}
                  className="bg-gray-50/50 p-4 rounded-[1.5rem] flex items-center justify-between border border-gray-100 transition-colors hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {child.gender === 'BOY'
                        ? '👦'
                        : child.gender === 'GIRL'
                        ? '👧'
                        : '👶'}
                    </span>
                    <div>
                      <div className="font-black text-xs text-[#2D2D2D] uppercase">
                        {child.gender}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 italic">
                        {child.age === 0 ? 'Newborn' : `${child.age} years old`}
                      </div>
                    </div>
                  </div>
                  {/* Botón individual de envío rápido */}
                  <button
                    onClick={() => handleBreakTheIce(child.id)}
                    disabled={isConnecting || !myChildId}
                    className="p-3 rounded-xl bg-white shadow-sm hover:bg-[#FF8A5C] hover:text-white disabled:opacity-30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Intereses */}
      <div className="px-8 py-4 flex flex-wrap gap-2">
        {childrenInterests.map((interest: InterestResponseDTO) => {
          const isMatch = myInterestIds.includes(interest.id)
          return (
            <span
              key={`interest-${interest.id}`}
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                isMatch
                  ? 'bg-[#FF8A5C] text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {interest.name}
            </span>
          )
        })}
      </div>

      {/* Footer / Botón Principal de Romper el Hielo */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-100">
        <button
          onClick={() => {
            const firstChildId = family.children[0]?.id
            if (hasActiveMatch) {
              navigate(`/chat/active`) // O la ruta que maneje tus chats activos
            } else if (firstChildId) {
              handleBreakTheIce(firstChildId)
            }
          }}
          disabled={isConnecting}
          className={`w-full py-4 font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] ${
            isConnecting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#2D2D2D] text-white hover:bg-black active:scale-95'
          }`}
        >
          {isConnecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MessageCircle className="w-4 h-4" />
          )}
          {isConnecting
            ? 'Connecting...'
            : hasActiveMatch
            ? 'Go to Chat'
            : 'Say Hi! 👋 Break the ice'}
        </button>
      </div>
    </div>
  )
}
