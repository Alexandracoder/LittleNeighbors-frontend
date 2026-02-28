import { Edit, Trash2, Cake, Tag } from 'lucide-react'
import type { ChildResponseDTO } from '../types'

interface ChildCardProps {
  child: ChildResponseDTO
  onEdit: (child: ChildResponseDTO) => void
  onDelete: (id: number) => void
}

export default function ChildCard({ child, onEdit, onDelete }: ChildCardProps) {
  return (
    
    <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all border-b-4 border-brand-yellow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          
          <h3 className="text-2xl font-bold text-brand-coral mb-1">
            {child.firstName}
          </h3>
          <div className="flex items-center gap-2 text-brand-dark/70">
            <Cake className="w-4 h-4 text-brand-orange" />
            <span className="text-sm font-medium">
              {child.age} {child.age === 1 ? 'year' : 'years'} old
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(child)}
            className="p-2 bg-brand-cream hover:bg-brand-yellow/30 text-brand-orange rounded-xl transition-all"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(child.id)}
            className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {child.interests && child.interests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-brand-dark text-sm font-bold">
            <Tag className="w-4 h-4 text-brand-coral" />
            <span>Interests</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {child.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-brand-yellow/10 text-brand-orange text-xs font-bold rounded-full border border-brand-yellow/40"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
