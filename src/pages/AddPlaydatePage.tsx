import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Send,
  Calendar as CalendarIcon,
  AlignLeft,
} from 'lucide-react'
import { playdateService } from '../services/playdateService'
import dashboardBg from '../assets/neighborhood-picnic1.png'

export default function AddPlaydatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { matchId } = location.state || {}

  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matchId || !title || !startTime) return

    setLoading(true)
    try {
      await playdateService.create(
        {
          title,
          startTime: new Date(startTime).toISOString(),
          description,
          matchId: Number(matchId),
        },
        token,
      )
      navigate('/my-schedules')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full p-6 text-white font-sans flex flex-col">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="fixed inset-0 z-10 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-20 max-w-2xl mx-auto w-full flex flex-col flex-grow">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-dark mb-8 font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all bg-white w-fit px-5 py-2.5 rounded-full shadow-xl"
        >
          <ArrowLeft className="w-3 h-3" /> Cancel
        </button>

        <h1 className="text-4xl font-black uppercase text-white mb-2 italic tracking-tighter">
          Suggest a <span className="text-[#F28749]">Playdate</span>
        </h1>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-10">
          Pick a time to meet your neighbor
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/95 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest flex items-center gap-2">
                <CalendarIcon size={12} className="text-[#F28749]" /> What's the
                plan?
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Park Afternoon / Coffee & Toys"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-brand-dark font-bold placeholder-gray-300 focus:ring-2 focus:ring-[#F28749] transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest flex items-center gap-2">
                <CalendarIcon size={12} className="text-[#F28749]" /> When?
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-brand-dark font-bold focus:ring-2 focus:ring-[#F28749] transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest flex items-center gap-2">
                <AlignLeft size={12} className="text-[#F28749]" /> Extra Details
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Anything else your neighbor should know?"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-brand-dark font-bold placeholder-gray-300 focus:ring-2 focus:ring-[#F28749] transition-all min-h-[120px] resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F28749] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#d97336] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              'Sending...'
            ) : (
              <>
                Send Proposal <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
