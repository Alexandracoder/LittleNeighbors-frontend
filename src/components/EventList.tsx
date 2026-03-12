import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'

interface Event {
  id: number
  title: string
  description: string
  eventDate: string
  neighborhoodName: string
  lat: number
  lon: number
}

interface EventListProps {
  events: Event[]
  loading: boolean
  error: string | null
}

export const EventList = ({ events, loading, error }: EventListProps) => {
  if (loading)
    return (
      <p className="text-center text-brand-dark/50 italic">
        Buscando eventos en tu barrio...
      </p>
    )

  if (error) return <p className="text-center text-red-500">{error}</p>

  if (events.length === 0)
    return (
      <p className="text-center text-brand-dark/70">
        No hay eventos en esta área por ahora.
      </p>
    )

  return (
    <div className="flex flex-col gap-6">
      {events.map(event => (
        <div
          key={event.id}
          className="flex gap-4 items-center bg-white/50 p-4 rounded-2xl hover:bg-white/80 transition-all border border-white/30"
        >
          <div className="bg-brand-coral text-white p-4 rounded-2xl shadow-sm">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-dark">{event.title}</h3>
            <p className="text-brand-orange text-sm font-bold uppercase tracking-wider">
              {new Date(event.eventDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-brand-dark/60 mt-1">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}