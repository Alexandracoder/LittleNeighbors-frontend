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
  // 1. Declaración de Estados
  const [gender, setGender] = useState<'BOY' | 'GIRL' | ''>('')
  const [birthDate, setBirthDate] = useState('')
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 2. Cargar intereses al montar el componente
  useEffect(() => {
    interestApi
      .getAll()
      .then(setAvailableInterests)
      .catch(err => console.error('Error loading interests:', err))
  }, [])

  // 3. Rellenar datos si estamos editando un niño existente
  useEffect(() => {
    if (child) {
      setGender(child.gender as 'BOY' | 'GIRL')

      if (child.birthDate) {
        setBirthDate(child.birthDate.split('T')[0])
      }

      if (child.interests && Array.isArray(child.interests)) {
        const ids = child.interests.map((i: any) =>
          typeof i === 'object' ? i.id : i,
        )
        setSelectedInterestIds(ids)
      }
    }
  }, [child])

  // 4. Manejadores de eventos
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
        interestIds: selectedInterestIds,
      }

      if (child) {
        await childApi.update(child.id, data)
      } else {
        await childApi.create(data)
      }
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save child profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto custom-scrollbar bg-white p-4 rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {child ? 'Update Profile' : 'New Neighbor'}
          </h2>
          <p className="text-orange-500 font-bold text-xs uppercase tracking-widest mt-1">
            Privacy-First Registration
          </p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-2 hover:bg-orange-50 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-300" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 px-2">
        {/* Selector de Género */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-tighter ml-1">
            Choose Gender
          </label>
          <div className="grid grid-cols-2 gap-4">
            {(['BOY', 'GIRL'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`py-5 rounded-[2rem] font-black text-sm transition-all border-2 flex flex-col items-center gap-2 ${
                  gender === g
                    ? 'border-orange-500 bg-orange-500 text-white shadow-xl shadow-orange-200 scale-[1.02]'
                    : 'border-orange-100 bg-gray-50 text-gray-400'
                }`}
              >
                <span className="tracking-widest uppercase">{g}</span>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    gender === g ? 'bg-white' : 'bg-orange-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Fecha de Nacimiento */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-tighter ml-1">
            Birth Date
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <Calendar className="w-5 h-5 text-orange-300" />
            </div>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-orange-50 rounded-3xl focus:border-orange-500 outline-none transition-all font-bold text-gray-700"
              required
            />
          </div>
        </div>

        {/* Intereses */}
        <div className="space-y-4">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-tighter ml-1">
            Interests & Hobbies
          </label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map(interest => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                  selectedInterestIds.includes(interest.id)
                    ? 'bg-orange-400 border-orange-400 text-white shadow-md'
                    : 'border-orange-100 text-gray-400 hover:border-orange-300'
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
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-5 bg-orange-500 text-white font-black rounded-3xl hover:bg-orange-600 shadow-2xl shadow-orange-200 disabled:opacity-50 uppercase tracking-widest text-xs transition-all"
          >
            {loading ? 'Saving...' : child ? 'Update Profile' : 'Add Child'}
          </button>
        </div>
      </form>
    </div>
  )
}
