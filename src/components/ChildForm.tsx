import { useState, useEffect, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Heart, Baby, Calendar, Sparkles, Loader2, Save } from 'lucide-react'
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
  const { t } = useTranslation()
  const [isPrenatal, setIsPrenatal] = useState(
    child ? child.lifeStage === 'PREGNANCY' : false,
  )
  const [gender, setGender] = useState<'BOY' | 'GIRL' | ''>(
    (child?.gender as 'BOY' | 'GIRL') || '',
  )
  const [birthDate, setBirthDate] = useState(
    child?.birthDate?.split('T')[0] || '',
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
    if (child) {
      setGender((child.gender as 'BOY' | 'GIRL') || '')
      if (child.birthDate) setBirthDate(child.birthDate.split('T')[0])
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
      setError(t('child.form.validationError'))
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
        interestIds: Array.from(selectedInterestIds),
      }

      if (child?.id) {
        await childApi.update(child.id, data)
      } else {
        await childApi.create(data)
      }
      onSuccess()
    } catch (err: any) {
      setError(t('child.form.saveError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-h-[85vh] overflow-y-auto hide-scrollbar bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">
            {child ? t('titleUpdate') : t('titleCreate')}
          </h2>
          <p className="text-brand-dark/30 font-bold text-[10px] uppercase tracking-widest mt-1">
            {t('privacyBadge')}
          </p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-3 bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange rounded-2xl transition-all group"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selector de Estado (Born / Prenatal) */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-50 rounded-[2rem]">
          <button
            type="button"
            onClick={() => setIsPrenatal(false)}
            className={`py-4 rounded-[1.6rem] font-black uppercase tracking-widest text-[10px] transition-all ${
              !isPrenatal
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-gray-400 hover:text-brand-dark'
            }`}
          >
            {t('born')}
          </button>
          <button
            type="button"
            onClick={() => setIsPrenatal(true)}
            className={`py-4 rounded-[1.6rem] font-black uppercase tracking-widest text-[10px] transition-all ${
              isPrenatal
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-gray-400 hover:text-brand-dark'
            }`}
          >
            {t('pregnant')}
          </button>
        </div>

        {!isPrenatal && (
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-brand-dark/40 uppercase tracking-widest ml-2">
              {t('genderLabel')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['BOY', 'GIRL'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all border-4 ${
                    gender === g
                      ? 'border-brand-orange bg-brand-orange text-white shadow-lg'
                      : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-brand-orange/20'
                  }`}
                >
                  <Baby className="w-4 h-4 inline mr-2 mb-1" />
                  {g === 'BOY'
                    ? t('genderBoy')
                    : t('genderGirl')}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-[10px] font-black text-brand-dark/40 uppercase tracking-widest ml-2">
            <Calendar className="w-3 h-3 inline mr-2 mb-0.5 text-brand-orange" />
            {t('birthDateLabel')}
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-4 border-transparent focus:border-brand-orange font-bold text-brand-dark text-sm transition-all"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-black text-brand-dark/40 uppercase tracking-widest ml-2">
            <Sparkles className="w-3 h-3 inline mr-2 mb-0.5 text-brand-orange" />
            {t('interestsLabel')}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map(interest => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-tight border-2 transition-all ${
                  selectedInterestIds.includes(interest.id)
                    ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                <Heart
                  className={`w-3 h-3 inline mr-2 ${
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
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-center animate-pulse">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-6 bg-brand-orange text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-lg hover:shadow-brand-orange/30 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              {child
                ? t('submitUpdate')
                : t('submitCreate')}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
