import { Calendar, MapPin, Users } from 'lucide-react'

export default function NeighborhoodEvents() {
  // Aquí más adelante harás un fetch de tu API
const events = [
    {
    id: 1,
    title: 'Parque Infantil Limpio',
    date: 'Mar 15, 10:00 AM',
    location: 'Parque Central',
    },
    {
    id: 2,
    title: 'Tarde de Juegos',
    date: 'Mar 18, 5:00 PM',
    location: 'Centro Comunitario',
    },
]

return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Eventos en el Barrio
    </h2>

    <div className="space-y-4">
        {events.map(event => (
        <div
            key={event.id}
            className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
        >
            <h3 className="font-bold text-lg">{event.title}</h3>
            <div className="flex gap-4 text-sm text-gray-300 mt-2">
            <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {event.date}
            </span>
            <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {event.location}
            </span>
            </div>
        </div>
        ))}
    </div>
    </div>
)
}
