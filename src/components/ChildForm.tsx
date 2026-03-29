import { useState, useEffect } from 'react'
import { childApi, interestApi } from '../services/api'
import type {
  ChildRequestDTO,
  ChildResponseDTO,
  InterestResponseDTO,
} from '../types'
import { X, Save, Loader2, Heart } from 'lucide-react'

interface ChildFormProps {
  initialData?: ChildResponseDTO | null
  onSuccess: () => void
  onCancel: () => void
}

export default function ChildForm({
  initialData,
  onSuccess,
  onCancel,
}: ChildFormProps) {
  const [loading, setLoading] = useState(false)
  const [allInterests, setAllInterests] = useState<InterestResponseDTO[]>([])
  const [formData, setFormData] = useState<ChildRequestDTO>({
    gender: 'OTHER',
    lifeStage: 'PREGNANCY',
    age: 0,
    birthDate: '',
    interestIds: [],
  })

  useEffect(() => {
    const loadInterests = async () => {
      try {
        const data = await interestApi.getAll()
        setAllInterests(data)
      } catch (err) {
        console.error('Error loading interests:', err)
      }
    }
    loadInterests()

    if (initialData) {
      setFormData({
        gender: initialData.gender,
        lifeStage: initialData.lifeStage,
        age: initialData.age || 0,
        birthDate: '',
        interestIds: initialData.interests?.map(i => i.id) || [],
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initialData?.id) {
        await childApi.update(initialData.id, formData)
      } else {
        await childApi.create(formData)
      }
      onSuccess()
    } catch (err) {
      console.error('Error saving child:', err)
      alert('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = (id: number) => {
    setFormData(prev => ({
      ...prev,
      interestIds: prev.interestIds.includes(id)
        ? prev.interestIds.filter(i => i !== id)
        : [...prev.interestIds, id],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-black text-gray-900">
          {initialData ? 'Edit Profile' : 'New Little Neighbor'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
            Life Stage
          </label>
          <select
            value={formData.lifeStage}
            onChange={e =>
              setFormData({ ...formData, lifeStage: e.target.value as any })
            }
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-400 rounded-2xl font-bold transition-all outline-none"
          >
            <option value="PREGNANCY">Pregnancy / Expecting</option>
            <option value="BORN">Already Born</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
            Gender
          </label>
          <select
        
            value={formData.gender || ''}
            onChange={e =>
              setFormData({ ...formData, gender: e.target.value as any })
            }
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-400 rounded-2xl font-bold transition-all outline-none"
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="BOY">Boy</option>
            <option value="GIRL">Girl</option>
            <option value="OTHER">Other / Surprise</option>
          </select>
        </div>

        {formData.lifeStage === 'BORN' && (
          <div className="space-y-3 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
              Age (Years)
            </label>
            <input
              type="number"
              min="0"
              max="18"
              value={formData.age}
              onChange={e =>
                setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
              }
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-400 rounded-2xl font-bold transition-all outline-none"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-orange-400" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">
            Interests & Hobbies
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allInterests.map(interest => (
            <button
              key={interest.id}
              type="button"
              onClick={() => toggleInterest(interest.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                formData.interestIds.includes(interest.id)
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200'
              }`}
            >
              {interest.name}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" />
              {initialData ? 'UPDATE PROFILE' : 'CREATE PROFILE'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
