import { useTranslation } from 'react-i18next'
import { Calendar, Clock, MapPin, Edit3, Trash2, EyeOff } from 'lucide-react'

interface EventCardProps {
  event: any
  neighborhoods: { id: number; name: string }[]
  onEdit: (event: any) => void
  onDelete: (id: number) => void
  onHide: (id: number) => void
  isOwner: boolean
}

export const EventCard = ({
  event,
  neighborhoods,
  onEdit,
  onDelete,
  onHide,
  isOwner,
}: EventCardProps) => {
  const { t } = useTranslation()

  const neighborhoodName =
    neighborhoods.find(n => n.id === event.neighborhoodId)?.name || 'Valencia'

  return (
    <div className="group bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/50 shadow-xl mb-6 transition-all hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98]">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#2D2D2D] leading-tight tracking-tight uppercase">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[#F28749]">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {neighborhoodName}
            </span>
          </div>
          {event.creatorFamilyName && (
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {t('events.card.organizedBy', 'Organiza')}: {event.creatorFamilyName}
            </p>
          )}
        </div>

        {/* Badge de fecha flotante */}
        <div className="bg-[#F28749] text-white p-3 rounded-2xl shadow-lg shadow-orange-200 flex flex-col items-center min-w-[50px]">
          <span className="text-xs font-black">
            {new Date(event.eventDate).getDate()}
          </span>
          <span className="text-[8px] uppercase font-bold">
            {new Date(event.eventDate).toLocaleDateString(undefined, {
              month: 'short',
            })}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
        {event.description}
      </p>

      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-6">
        <div className="flex items-center gap-1.5 bg-white/30 px-3 py-1.5 rounded-full">
          <Calendar className="w-3 h-3 text-[#F28749]" />
          {new Date(event.eventDate).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1.5 bg-white/30 px-3 py-1.5 rounded-full">
          <Clock className="w-3 h-3 text-[#F28749]" />
          {new Date(event.eventDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {isOwner ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onEdit(event)}
            className="flex items-center justify-center gap-2 bg-white/50 text-[#2D2D2D] py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F28749] hover:text-white transition-all shadow-sm border border-white"
          >
            <Edit3 className="w-3 h-3" />
            {t('common.edit', 'Editar')}
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="flex items-center justify-center gap-2 bg-red-500/10 text-red-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
          >
            <Trash2 className="w-3 h-3" />
            {t('common.delete', 'Eliminar')}
          </button>
        </div>
      ) : (
        <button
          onClick={() => onHide(event.id)}
          className="w-full flex items-center justify-center gap-2 bg-white/50 text-gray-500 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all shadow-sm border border-white"
        >
          <EyeOff className="w-3 h-3" />
          {t('events.card.hideFromMe', 'Quitar de mi vista')}
        </button>
      )}
    </div>
  )
}
