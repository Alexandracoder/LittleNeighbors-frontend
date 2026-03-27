import {
  User,
  Baby,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FamilyResponseDTO } from '../types'
import { childApi } from '../services/api'

interface FamilyCardProps {
  family: FamilyResponseDTO
  myChildId: number | undefined
  myInterestIds?: number[] // Usamos IDs para comparar mejor
}

export default function FamilyCard({
  family,
  myChildId,
  myInterestIds = [],
}: FamilyCardProps) {
  const navigate = useNavigate()
  const [matchStatus, setMatchStatus] = useState<
    Record<number, 'idle' | 'loading' | 'success'>
  >({})

  const hasActiveMatch = useMemo(
    () => Object.values(matchStatus).includes('success'),
    [matchStatus],
  )

  // Consolidamos intereses únicos de todos los niños de esta familia para mostrar en la card
  const familyInterests = useMemo(() => {
    const all = family.children.flatMap(c => c.interests || [])
    // Eliminamos duplicados por ID
    return Array.from(new Map(all.map(item => [item.id, item])).values())
  }, [family.children])

  const handleRequestMatch = async (targetChildId: number) => {
    if (typeof myChildId !== 'number') return
    setMatchStatus(prev => ({ ...prev, [targetChildId]: 'loading' }))
    try {
      await childApi.requestMatch(myChildId, targetChildId)
      setMatchStatus(prev => ({ ...prev, [targetChildId]: 'success' }))
    } catch (err) {
      setMatchStatus(prev => ({ ...prev, [targetChildId]: 'idle' }))
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-brand-orange/10 flex flex-col h-full group">
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-brand-cream p-4 rounded-2xl group-hover:bg-brand-orange transition-colors duration-500">
            <User className="w-8 h-8 text-brand-orange group-hover:text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange bg-orange-50 px-3 py-1 rounded-full">
            {family.neighborhoodName || 'Neighbor'}
          </span>
        </div>
        <h3 className="text-2xl font-black text-brand-dark tracking-tight mb-2 uppercase italic">
          The {family.familyName}s
        </h3>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 min-h-[40px]">
          {family.description || 'Looking for new friends!'}
        </p>
      </div>

      {/* Children List */}
      <div className="px-8 py-4 flex-1">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
          <Baby className="w-4 h-4 text-brand-coral" />
          Potential Playmates
        </div>

        <div className="space-y-3">
          {family.children.map(child => (
            <div
              key={child.id}
              className="bg-gray-50/50 p-4 rounded-[1.5rem] flex items-center justify-between border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {child.gender === 'BOY' ? '👦' : '👧'}
                </span>
                <div>
                  <div className="font-black text-xs text-brand-dark uppercase">
                    {child.gender}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 italic">
                    {child.age} years old
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRequestMatch(child.id)}
                disabled={matchStatus[child.id] !== 'idle' || !myChildId}
                className={`p-3 rounded-xl transition-all ${
                  matchStatus[child.id] === 'success'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white shadow-sm hover:bg-brand-orange hover:text-white disabled:opacity-30'
                }`}
              >
                {matchStatus[child.id] === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : matchStatus[child.id] === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags de Intereses (Ilumina si coinciden con los de tu hijo) */}
      {familyInterests.length > 0 && (
        <div className="px-8 py-4 flex flex-wrap gap-2">
          {familyInterests.map(interest => {
            const isMatch = myInterestIds.includes(interest.id)
            return (
              <span
                key={interest.id}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                  isMatch
                    ? 'bg-brand-orange text-white shadow-sm'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {interest.name}
              </span>
            )
          })}
        </div>
      )}

      {/* Footer / Chat */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-100">
        <button
          onClick={() => navigate(`/chat/${family.id}`)}
          disabled={!hasActiveMatch}
          className={`w-full py-4 font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] ${
            hasActiveMatch
              ? 'bg-brand-dark text-white hover:bg-black'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {hasActiveMatch ? 'Start Conversation' : 'Connect to Chat'}
        </button>
      </div>
    </div>
  )
}
