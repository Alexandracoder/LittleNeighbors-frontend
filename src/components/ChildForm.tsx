import { useState, useEffect, FormEvent } from 'react'
import { X, Calendar } from 'lucide-react'
import { childApi } from '../services/api'
import type { ChildResponseDTO, ChildRequestDTO } from '../types'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (child) {
      setGender(child.gender)
      // Si el backend solo devuelve edad, calculamos un año aproximado
      const year = new Date().getFullYear() - child.age
      setBirthDate(`${year}-01-01`)
    }
  }, [child])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!gender || !birthDate) {
      setError('Please fill in all fields')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Ajuste para coincidir con el Record Java: ChildRequestDTO
      const data: ChildRequestDTO = {
        gender: gender as 'BOY' | 'GIRL',
        birthDate: birthDate, // Formato YYYY-MM-DD
        interestIds: [], // Enviamos Set vacío para evitar el @NotNull del backend
      }

      if (child) {
        await childApi.update(child.id, data)
      } else {
        await childApi.create(data)
      }
      onSuccess()
    } catch (err: any) {
      console.error('API Error:', err.response?.data || err.message)
      setError(
        err.response?.data?.message ||
          'Failed to save child. Check the information provided.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            {child ? 'Update Profile' : 'New Neighbor'}
          </h2>
          <p className="text-brand-orange font-bold text-xs uppercase tracking-widest mt-1">
            Privacy-First Registration
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-brand-yellow/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-brand-dark/30" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 px-2">
        {/* SELECTOR DE GÉNERO */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-brand-dark/50 uppercase tracking-tighter ml-1">
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
                    ? 'border-brand-orange bg-brand-orange text-white shadow-xl shadow-brand-orange/20 scale-[1.02]'
                    : 'border-brand-yellow/30 bg-brand-cream/40 text-brand-dark/40 hover:border-brand-orange/30'
                }`}
              >
                <span className="tracking-widest uppercase">{g}</span>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    gender === g ? 'bg-white' : 'bg-brand-orange/20'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* FECHA DE NACIMIENTO */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-brand-dark/50 uppercase tracking-tighter ml-1">
            Birth Date
          </label>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <Calendar className="w-5 h-5 text-brand-orange/40" />
            </div>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-brand-cream/40 border-2 border-brand-yellow/20 rounded-3xl focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-brand-coral/10 border border-brand-coral/20 text-brand-coral rounded-2xl text-xs font-bold">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 text-brand-dark/40 font-black uppercase tracking-widest text-[10px] hover:text-brand-coral"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-5 bg-brand-orange text-white font-black rounded-3xl hover:bg-brand-coral transition-all shadow-2xl shadow-brand-orange/30 disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? 'Saving...' : child ? 'Update' : 'Add Child'}
          </button>
        </div>
      </form>
    </div>
  )
}
