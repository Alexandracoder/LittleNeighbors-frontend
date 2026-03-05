import { User, Baby, Heart, MessageCircle } from 'lucide-react'
import type { FamilyResponseDTO } from '../types'

interface FamilyCardProps {
  family: FamilyResponseDTO
}

// Movido aquí para asegurar que TS lo trate como una función pura de apoyo
const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age < 0 ? 0 : age
}

export default function FamilyCard({ family }: FamilyCardProps) {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-brand-orange/20 flex flex-col h-full group">
      {/* Header de la Familia */}
      <div className="p-8 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-brand-cream p-4 rounded-2xl group-hover:bg-brand-orange transition-colors duration-500">
            <User className="w-8 h-8 text-brand-orange group-hover:text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange bg-orange-50 px-3 py-1 rounded-full">
            {family.neighborhood?.name || 'Neighbor'}
          </span>
        </div>

        <h3 className="text-2xl font-black text-brand-dark tracking-tight mb-2 uppercase">
          The {family.familyName}s
        </h3>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 min-h-[40px]">
          {family.description ||
            'A friendly family looking for playmates in the neighborhood!'}
        </p>
      </div>

      {/* Sección de Niños (Playmates) */}
      <div className="px-8 py-4 flex-1">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
          <Baby className="w-4 h-4 text-brand-coral" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
            Potential Playmates
          </span>
        </div>

        <div className="space-y-4">
          {family.children && family.children.length > 0 ? (
            family.children.map((child, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-brand-orange/10 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black text-xs text-brand-dark uppercase">
                    {child.gender === 'BOY' ? 'Boy' : 'Girl'}
                  </span>
                  {/* CORRECCIÓN: Asegúrate de que no haya un <span> extra envolviendo la función de forma incorrecta */}
                  <span className="text-[10px] font-bold text-brand-orange bg-white px-2 py-0.5 rounded-lg shadow-sm">
                    {calculateAge(child.birthDate)} years old
                  </span>
                </div>

                {/* Intereses del niño */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {child.interests?.map((interest: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm"
                    >
                      <Heart className="w-2 h-2 text-brand-coral fill-brand-coral" />
                      <span className="text-[8px] font-bold text-gray-500 uppercase">
                        {interest.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs italic text-gray-400">
              No children profiles listed yet.
            </p>
          )}
        </div>
      </div>

      {/* Acción: Contactar */}
      <div className="p-6 bg-gray-50/50 mt-auto border-t border-gray-100">
        <button className="w-full py-4 bg-white text-brand-dark font-black rounded-2xl shadow-md hover:bg-brand-dark hover:text-white transition-all flex items-center justify-center gap-3 group/btn uppercase tracking-widest text-[10px]">
          <MessageCircle className="w-4 h-4 text-brand-orange group-hover/btn:scale-110 transition-transform" />
          Say Hello!
        </button>
      </div>
    </div>
  )
}
