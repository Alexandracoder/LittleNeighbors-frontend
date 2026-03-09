import { useState, useEffect, FormEvent } from 'react'
import { X, Heart, Baby, Calendar } from 'lucide-react'
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
  // Estado para distinguir entre hijo nacido o embarazo
  const [isPrenatal, setIsPrenatal] = useState(
    child ? !!child.isPrenatal : false,
  )
  const [gender, setGender] = useState<'BOY' | 'GIRL' | ''>(child?.gender || '')
  const [birthDate, setBirthDate] = useState(
    child?.birthDate?.split('T')[0] || '',
  )
  const [dueDate, setDueDate] = useState(child?.dueDate?.split('T')[0] || '')
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    interestApi
      .getAll()
      .then(setAvailableInterests)
      .catch(err => console.error('Error loading interests:', err))
  }, [])

  useEffect(() => {
    if (child) {
      setGender(child.gender || '')
      if (child.birthDate) setBirthDate(child.birthDate.split('T')[0])
      if (child.dueDate) setDueDate(child.dueDate.split('T')[0])
      if (child.interests) {
        const ids = child.interests.map((i: any) =>
          typeof i === 'object' ? i.id : Number(i),
        )
        setSelectedInterestIds(ids)
      }
    }
  }, [child])

  const toggleInterest = (id: number) => {
    setSelectedInterestIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isPrenatal && !gender) {
      setError('Please select a gender')
      return
    }

    if (selectedInterestIds.length === 0) {
      setError('Please select at least one interest')
      return
    }

    setError('')
    setLoading(true)

    try {
      const data: ChildRequestDTO = {
        isPrenatal: isPrenatal,
        lifeStage: isPrenatal ? 'PREGNANCY' : 'BORN',
        gender: isPrenatal ? null : (gender as 'BOY' | 'GIRL'),
        birthDate: isPrenatal ? null : birthDate,
        dueDate: isPrenatal ? dueDate : null,
        interestIds: Array.from(selectedInterestIds),
      }

      if (child?.id) {
        await childApi.update(child.id, data)
      } else {
        await childApi.create(data)
      }
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving child profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto custom-scrollbar bg-white p-6 rounded-[3rem] shadow-inner">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          {child ? 'Update Profile' : 'New Neighbor'}
        </h2>
        <button
          onClick={onClose}
          type="button"
          className="p-3 bg-gray-50 hover:bg-orange-50 rounded-2xl transition-all"
        >
          <X className="w-6 h-6 text-gray-300" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selector de Estado */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setIsPrenatal(false)}
            className={`py-4 rounded-2xl font-black transition-all ${
              !isPrenatal
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            Born
          </button>
          <button
            type="button"
            onClick={() => setIsPrenatal(true)}
            className={`py-4 rounded-2xl font-black transition-all ${
              isPrenatal
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            Pregnant
          </button>
        </div>

        {!isPrenatal && (
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['BOY', 'GIRL'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-6 rounded-[2.5rem] font-black text-xs transition-all border-4 ${
                    gender === g
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-50 bg-gray-50 text-gray-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            {isPrenatal ? 'Due Date' : 'Birth Date'}
          </label>
          <input
            type="date"
            value={isPrenatal ? dueDate : birthDate}
            onChange={e =>
              isPrenatal
                ? setDueDate(e.target.value)
                : setBirthDate(e.target.value)
            }
            className="w-full p-5 bg-gray-50 rounded-[2rem] outline-none border-4 border-transparent focus:border-orange-500"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map(interest => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase border-2 ${
                  selectedInterestIds.includes(interest.id)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-400 border-gray-100'
                }`}
              >
                <Heart className="w-3 h-3 inline mr-1" />
                {interest.name}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-500 text-xs font-bold">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-6 bg-brand-dark text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em]"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
