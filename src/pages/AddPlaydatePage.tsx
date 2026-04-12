import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { playdateService } from '../services/playdateService'

export default function AddPlaydatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { matchId } = location.state || {}

  // Recuperamos el token (ajusta según dónde lo guardes, ej. localStorage)
  const token = localStorage.getItem('token') || ''

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        title: formData.title,
        startTime: `${formData.date}T${formData.time}:00`, // Formato ISO para Java LocalDateTime
        matchId: Number(matchId),
        status: 'PENDING',
      }

      await playdateService.create(payload, token)

      // Si todo sale bien, volvemos a la lista de citas
      navigate('/my-schedules')
    } catch (err) {
      console.error('Error creating playdate:', err)
      alert('Failed to send proposal. Make sure the backend is running!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] p-6 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 mb-8 font-black uppercase tracking-widest text-[10px] hover:text-brand-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel
      </button>

      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-black uppercase italic text-brand-dark mb-8 tracking-tighter">
          Suggest a <span className="text-[#F28749]">Playdate</span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[2.5rem] p-8 shadow-xl space-y-6 border border-gray-50"
        >
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">
              What's the plan?
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Park & Picnic"
              value={formData.title}
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-[#F28749] outline-none transition-all"
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">
                Day
              </label>
              <input
                required
                type="date"
                value={formData.date}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#F28749] transition-all"
                onChange={e =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">
                Time
              </label>
              <input
                required
                type="time"
                value={formData.time}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#F28749] transition-all"
                onChange={e =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#F28749] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-100 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send size={16} /> Send Proposal
              </>
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100">
          <p className="text-center text-[9px] text-[#F28749] font-black uppercase tracking-[0.2em]">
            Target Match ID: {matchId || 'General'}
          </p>
        </div>
      </div>
    </div>
  )
}
