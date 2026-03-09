import {
  User,
  Baby,
  Heart,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useState } from 'react'
import type { FamilyResponseDTO } from '../types'
import { childApi } from '../services/api'

interface FamilyCardProps {
  family: FamilyResponseDTO
  myChildId?: number // ID del hijo del usuario logueado para hacer el match
}

const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age < 0 ? 0 : age
}

export default function FamilyCard({ family, myChildId }: FamilyCardProps) {
  const [matchStatus, setMatchStatus] = useState<
    Record<number, 'idle' | 'loading' | 'success'>
  >({})

  const handleRequestMatch = async (targetChildId: number) => {
    if (!myChildId) return
    setMatchStatus(prev => ({ ...prev, [targetChildId]: 'loading' }))
    try {
      await childApi.requestMatch(myChildId, targetChildId)
      setMatchStatus(prev => ({ ...prev, [targetChildId]: 'success' }))
    } catch (err) {
      setMatchStatus(prev => ({ ...prev, [targetChildId]: 'idle' }))
      alert('Error al enviar la solicitud.')
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-brand-orange/20 flex flex-col h-full group">
      <div className="p-8 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-brand-cream p-4 rounded-2xl group-hover:bg-brand-orange transition-colors duration-500">
            <User className="w-8 h-8 text-brand-orange group-hover:text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange bg-orange-50 px-3 py-1 rounded-full">
            {family.neighborhoodName || 'Neighbor'}
          </span>
        </div>
        <h3 className="text-2xl font-black text-brand-dark tracking-tight mb-2 uppercase">
          The {family.familyName}s
        </h3>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 min-h-[40px]">
          {family.description || 'A friendly family looking for playmates!'}
        </p>
      </div>

      <div className="px-8 py-4 flex-1">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
          <Baby className="w-4 h-4 text-brand-coral" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
            Potential Playmates
          </span>
        </div>

        <div className="space-y-4">
          {family.children?.length > 0 ? (
            family.children.map(child => (
              <div
                key={child.id}
                className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <div className="font-black text-xs text-brand-dark uppercase">
                    {child.gender}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500">
                    {child.age} years old
                  </div>
                </div>

                {/* Botón de Match por cada hijo */}
                <button
                  onClick={() => handleRequestMatch(child.id)}
                  disabled={matchStatus[child.id] !== 'idle'}
                  className={`p-3 rounded-xl transition-all ${
                    matchStatus[child.id] === 'success'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-white hover:bg-brand-orange hover:text-white'
                  }`}
                >
                  {matchStatus[child.id] === 'loading' && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {matchStatus[child.id] === 'success' && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {matchStatus[child.id] === 'idle' && (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs italic text-gray-400">
              No children profiles listed.
            </p>
          )}
        </div>
      </div>

      <div className="p-6 bg-gray-50/50 mt-auto border-t border-gray-100">
        <button className="w-full py-4 bg-white text-brand-dark font-black rounded-2xl shadow-md hover:bg-brand-dark hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]">
          <MessageCircle className="w-4 h-4" /> Say Hello!
        </button>
      </div>
    </div>
  )
}
