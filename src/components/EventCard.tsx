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

  const neighborhoodName =
    neighborhoods.find(n => n.id === event.neighborhoodId)?.name || 'Valencia'

  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-md border border-gray-100 mb-4 transition-all active:scale-[0.98]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-black text-brand-dark leading-tight">
          {event.title}
        </h3>
        {/* Mostramos el NOMBRE en lugar del ID */}
        <span className="bg-brand-coral/10 text-brand-coral text-[10px] font-bold px-2 py-1 rounded-full uppercase">
          📍 {neighborhoodName}
        </span>
      </div>

      <p className="text-gray-500 text-sm line-clamp-2 mb-4">
        {event.description}
      </p>

      <div className="flex items-center text-xs text-gray-400 mb-4">
        <span className="mr-3">
          📅 {new Date(event.eventDate).toLocaleDateString()}
        </span>
        <span>
          ⏰{' '}
          {new Date(event.eventDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onEdit(event)}
          className="bg-gray-100 text-brand-dark py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="bg-red-50 text-red-500 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
