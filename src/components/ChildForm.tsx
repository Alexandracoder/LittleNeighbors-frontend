import { useState, useEffect, FormEvent } from 'react'
import { X, Heart, Calendar } from 'lucide-react'
import { childApi, interestApi } from '../services/api'
import type {
  ChildResponseDTO,
  ChildRequestDTO,
  InterestResponseDTO,
  Gender,
  LifeStage,
} from '../types'

interface ChildFormProps {
  child: ChildResponseDTO | null
  onClose: () => void
  onSuccess: () => void
}

const calculateLifeStage = (birthDateStr: string | null): LifeStage => {
  if (!birthDateStr) return 'BORN' as LifeStage
  const birthDate = new Date(birthDateStr)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  if (age < 2) return 'BABY' as LifeStage
  if (age < 4) return 'TODDLER' as LifeStage
  if (age < 6) return 'PRE_SCHOOLER' as LifeStage
  if (age < 12) return 'SCHOOL_AGE' as LifeStage
  return 'ADOLESCENT' as LifeStage
}

export default function ChildForm({
  child,
  onClose,
  onSuccess,
}: ChildFormProps) {
  const [isPrenatal, setIsPrenatal] = useState(
    child?.isPrenatal || child?.lifeStage === 'PREGNANCY',
  )
  const [gender, setGender] = useState<Gender | ''>(child?.gender || '')
  const [birthDate, setBirthDate] = useState(
    child?.birthDate ? child.birthDate.split('T')[0] : '',
  )
  const [dueDate, setDueDate] = useState(
    child?.dueDate ? child.dueDate.split('T')[0] : '',
  )
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
    if (child && child.interests) {
      const ids = child.interests.map((i: any) =>
        typeof i === 'object' ? i.id : Number(i),
      )
      setSelectedInterestIds(ids)
    }
  }, [child])

  const toggleInterest = (id: number) => {
    setSelectedInterestIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (selectedInterestIds.length === 0) {
      setError('Please select at least one interest')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Sincronizado con ChildRequestDTO.java
      const data: ChildRequestDTO = {
        lifeStage: isPrenatal ? 'PREGNANCY' : calculateLifeStage(birthDate),
        gender: isPrenatal ? null : (gender as Gender),
        birthDate: isPrenatal ? null : birthDate || null,
        dueDate: isPrenatal ? dueDate || null : null,
        interestIds: selectedInterestIds,
        isPrenatal: isPrenatal,
      }

      if (child?.id) {
        await childApi.update(child.id, data)
      } else {
        await childApi.create(data)
      }
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check your fields and try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto bg-white p-6 rounded-[3rem] custom-scrollbar">
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
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setIsPrenatal(false)}
            className={`py-4 rounded-2xl font-black transition-all ${
              !isPrenatal
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
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
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            Pregnant
          </button>
        </div>

        {!isPrenatal ? (
          <>
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

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Birth Date
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full p-5 bg-gray-50 rounded-[2rem] outline-none border-4 border-transparent focus:border-orange-500 transition-all font-bold"
              />
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-orange-500" /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full p-5 bg-orange-50 rounded-[2rem] outline-none border-4 border-orange-200 focus:border-orange-500 text-orange-700 font-bold"
            />
          </div>
        )}

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
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${
                  selectedInterestIds.includes(interest.id)
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100'
                    : 'bg-white text-gray-400 border-gray-100'
                }`}
              >
                <Heart
                  className={`w-3 h-3 inline mr-1 ${
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

        {error && (
          <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border-2 border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-6 bg-gray-900 text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em] hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
