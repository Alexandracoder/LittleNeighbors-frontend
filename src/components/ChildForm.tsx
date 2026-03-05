import { useState, useEffect, FormEvent } from 'react'
import { X, Calendar, Heart } from 'lucide-react'
import { childApi, interestApi } from '../services/api'
import type {
  ChildResponseDTO,
  ChildRequestDTO,
  InterestResponseDTO,
} from '../types'

interface ChildFormProps {
  child: ChildResponseDTO | null
  onClose: () => void
  onSuccess: () => void
}

export default function ChildForm({
  child,
  onClose,
  onSuccess,
}: ChildFormProps) {
  const [gender, setGender] = useState<'BOY' | 'GIRL' | ''>('')
  const [birthDate, setBirthDate] = useState('')
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar intereses disponibles
  useEffect(() => {
    interestApi
      .getAll()
      .then(setAvailableInterests)
      .catch(err => console.error('Error loading interests:', err))
  }, [])

  // Rellenar datos para edición
  useEffect(() => {
    if (child) {
      setGender(child.gender as 'BOY' | 'GIRL')
      if (child.birthDate) {
        setBirthDate(child.birthDate.split('T')[0])
      }
      if (child.interests) {
        // Aseguramos que extraemos el ID numérico correctamente
        const ids = child.interests.map((i: any) =>
          typeof i === 'object' ? i.id : Number(i),
        )
        setSelectedInterestIds(ids)
      }
    } else {
      // Si no hay niño (creación), reseteamos los campos
      setGender('')
      setBirthDate('')
      setSelectedInterestIds([])
    }
  }, [child])

  const toggleInterest = (id: number) => {
    setSelectedInterestIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!gender || !birthDate) {
      setError('Please fill in all fields')
      return
    }

    setError('')
    setLoading(true)

try {
  const data: ChildRequestDTO = {
    gender: gender as 'BOY' | 'GIRL',
    birthDate: birthDate,
    // CONVIERTE EL SET O EL ARRAY A UN ARRAY PLANO DE NÚMEROS
    interestIds: Array.from(selectedInterestIds),
  }

  if (child?.id) {
    // Aquí child.id es 4, según tu log
    await childApi.update(child.id, data)
  } else {
    await childApi.create(data)
  }
  onSuccess()
} catch (err: any) {
  console.error('Error saving child:', err)
  setError(
    err.response?.data?.message ||
      'Failed to save child profile. Check your connection.',
  )
} finally {
  setLoading(false)
}
  }

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto custom-scrollbar bg-white p-6 rounded-[3rem] shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {child ? 'Update Profile' : 'New Neighbor'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              Safe & Private Space
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-3 bg-gray-50 hover:bg-orange-50 rounded-2xl transition-all group"
        >
          <X className="w-6 h-6 text-gray-300 group-hover:text-orange-500 group-hover:rotate-90 transition-all" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selector de Género */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Gender Identity
          </label>
          <div className="grid grid-cols-2 gap-4">
            {(['BOY', 'GIRL'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`py-6 rounded-[2.5rem] font-black text-xs transition-all border-4 flex flex-col items-center gap-3 ${
                  gender === g
                    ? 'border-orange-500 bg-orange-500 text-white shadow-xl shadow-orange-100'
                    : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-orange-100'
                }`}
              >
                <span className="tracking-[0.2em]">{g}</span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    gender === g ? 'bg-white' : 'bg-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Fecha de Nacimiento */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Birth Date
          </label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <Calendar className="w-5 h-5 text-orange-400 group-focus-within:scale-110 transition-transform" />
            </div>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-gray-50 border-4 border-transparent rounded-[2rem] focus:border-orange-500/20 focus:bg-white outline-none transition-all font-bold text-gray-700 shadow-sm"
              required
            />
          </div>
        </div>

        {/* Intereses */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Passions & Interests
          </label>
          <div className="flex flex-wrap gap-2 p-1">
            {availableInterests.map(interest => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                  selectedInterestIds.includes(interest.id)
                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100 scale-105'
                    : 'border-gray-100 bg-white text-gray-400 hover:border-orange-200'
                }`}
              >
                <Heart
                  className={`w-3 h-3 ${
                    selectedInterestIds.includes(interest.id)
                      ? 'fill-current'
                      : ''
                  }`}
                />
                {interest.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-5 bg-red-50 border-2 border-red-100 text-red-500 rounded-3xl text-[11px] font-black uppercase tracking-wider animate-in slide-in-from-top-2">
            ⚠️ {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center gap-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-orange-500 transition-colors"
          >
            Go Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-6 bg-brand-dark text-white font-black rounded-[2.5rem] hover:bg-black shadow-2xl disabled:opacity-50 uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95"
          >
            {loading
              ? 'Processing...'
              : child
              ? 'Save Changes'
              : 'Welcome Home!'}
          </button>
        </div>
      </form>
    </div>
  )
}
