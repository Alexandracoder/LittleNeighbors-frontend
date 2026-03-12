import { useState } from 'react'

export const CreateEventForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    latitude: 39.4699,
    longitude: 0.3763,
    neighborhoodName: 'Mislata',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('accessToken')

    try {
      const response = await fetch('http://localhost:8080/api/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess() // Esto refrescará la lista y el mapa
      }
    } catch (err) {
      console.error('Error creando evento:', err)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-lg space-y-4"
    >
      <h2 className="text-xl font-black text-brand-dark">Crear Nuevo Evento</h2>

      <input
        className="w-full p-3 border rounded-xl"
        placeholder="Título del evento"
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <textarea
        className="w-full p-3 border rounded-xl"
        placeholder="Descripción"
        onChange={e =>
          setFormData({ ...formData, description: e.target.value })
        }
        required
      />

      <input
        type="datetime-local"
        className="w-full p-3 border rounded-xl"
        onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
        required
      />

      <button
        type="submit"
        className="w-full bg-brand-coral text-white p-3 rounded-xl font-bold hover:bg-brand-orange transition-all"
      >
        Publicar Evento
      </button>
    </form>
  )
}
