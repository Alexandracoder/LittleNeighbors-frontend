import { useTranslation } from 'react-i18next'
import { Calendar, Clock, MapPin, Edit3, Trash2 } from 'lucide-react'

interface EventCardProps {
  event: any
  neighborhoods: { id: number; name: string }[]
  onEdit: (event: any) => void
  onDelete: (id: number) => void
}

export const EventCard = ({
  event,
  neighborhoods,
  onEdit,
  onDelete,
}: EventCardProps) => {
  const { t, i18n } = useTranslation()

  const neighborhoodName =
    neighborhoods.find(n => n.id === event.neighborhoodId)?.name || 'Valencia'

  const eventDate = new Date(event.eventDate)

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-4 transition-all hover:shadow-md active:scale-[0.98] group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-black text-brand-dark leading-tight uppercase tracking-tighter">
          {event.title}
        </h3>
        <span className="flex items-center gap-1 bg-brand-coral/10 text-brand-coral text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
          <MapPin className="w-3 h-3" /> {neighborhoodName}
        </span>
      </div>

      <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-5">
        {event.description}
      </p>

      <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-brand-orange" />
          {eventDate.toLocaleDateString(i18n.language)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-orange" />
          {eventDate.toLocaleTimeString(i18n.language, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onEdit(event)}
          className="flex items-center justify-center gap-2 bg-gray-50 text-brand-dark py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          {t('back').toLowerCase() === 'atrás' ? 'Editar' : 'Edit'}
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="flex items-center justify-center gap-2 bg-red-50 text-red-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t('back').toLowerCase() === 'atrás' ? 'Eliminar' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
