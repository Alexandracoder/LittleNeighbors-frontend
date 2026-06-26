import { useState } from 'react'
import { Calendar, MapPin, Clock, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import playdateService from '../services/playdateService'

interface Props {
  matchId: number
  onSuccess: () => void
  onClose: () => void
}

const AddPlaydateModal: React.FC<Props> = ({ matchId, onSuccess, onClose }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    time: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {

      const startTime = `${formData.date}T${formData.time}:00`
      await playdateService.create({
        matchId,
        title: formData.title,
        location: formData.location,
        startTime,
        status: 'PENDING'
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error creating proposal", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-10 duration-300">
        <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter mb-6">
          {t('playdates.form.proposeTitle', 'Proponer Encuentro')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <input 
              required
              className="bg-transparent w-full outline-none text-gray-900 font-bold uppercase text-xs"
              placeholder={t('playdates.form.placeholderTitle', '¿Qué plan tenéis? (ej. Tarde de Columpios)')}
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-2">
              <Calendar size={16} className="text-[#F28749]" />
              <input 
                type="date" required
                className="bg-transparent w-full outline-none text-gray-900 font-bold text-xs"
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-2">
              <Clock size={16} className="text-[#F28749]" />
              <input 
                type="time" required
                className="bg-transparent w-full outline-none text-gray-900 font-bold text-xs"
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-2">
            <MapPin size={16} className="text-[#F28749]" />
            <input 
              required
              className="bg-transparent w-full outline-none text-gray-900 font-bold text-xs"
              placeholder={t('playdates.form.location', 'Lugar de encuentro')}
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 border border-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] bg-gray-900 text-[#FF9E91] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {loading ? '...' : <><Send size={14} /> {t('playdates.form.sendProposal')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}