import { Edit, Trash2, Cake, Tag } from 'lucide-react'
import type { ChildResponseDTO } from '../types'

interface ChildCardProps {
  child: ChildResponseDTO
  onEdit: (child: ChildResponseDTO) => void
  onDelete: (id: number) => void
}

export default function ChildCard({ child, onEdit, onDelete }: ChildCardProps) {
  // Función para calcular edad real si el backend falla o devuelve 0
  const getDisplayAge = () => {
    if (child.age && child.age > 0) return child.age
    if (!child.birthDate) return 0

    const birth = new Date(child.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const age = getDisplayAge()

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl p-8 hover:shadow-2xl transition-all border-b-8 border-orange-400">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {/* En el DTO pusimos que firstName era ReactNode por error en el tipo, 
              aquí lo tratamos como string. Si no tienes nombre, usa el género */}
          <h3 className="text-2xl font-black text-gray-900 mb-1">
            {child.gender === 'BOY' ? 'Little Boy' : 'Little Girl'}
          </h3>
          <div className="flex items-center gap-2 text-gray-500">
            <Cake className="w-5 h-5 text-orange-400" />
            <span className="text-lg font-bold">
              {age} {age === 1 ? 'year' : 'years'} old
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(child)}
            className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
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
      </div>

      {child.interests && child.interests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <Tag className="w-4 h-4 text-orange-300" />
            <span>Interests</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {child.interests.map((interest: any, index) => (
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
    </div>
  )
}
