import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { EventCard } from './EventCard'

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

  function handleOpenEdit(event: any): void {
    throw new Error('Function not implemented.')
  }

  function handleDelete(id: number): void {
    throw new Error('Function not implemented.')
  }

  return (
    <div className="flex flex-col p-4">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}