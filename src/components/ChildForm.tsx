import { useState, useEffect } from 'react'
import { childApi, interestApi } from '../services/api'
import { useTranslation } from 'react-i18next' // 1. Importar hook
import type {
  ChildRequestDTO,
  ChildResponseDTO,
  InterestResponseDTO,
} from '../types'
import { X, Save, Loader2, Heart, Calendar } from 'lucide-react'

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
  const { t } = useTranslation() // 2. Inicializar t
  const [loading, setLoading] = useState(false)
  const [allInterests, setAllInterests] = useState<InterestResponseDTO[]>([])
  const [formData, setFormData] = useState<ChildRequestDTO>({
    gender: 'BOY',
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
        console.error(err)
      }
    }
    loadInterests()

    if (initialData) {
      setFormData({
        gender: initialData.gender,
        lifeStage: initialData.lifeStage,
        age: initialData.age ?? 0,
        birthDate: initialData.birthDate || '',
        interestIds: initialData.interests?.map(i => i.id) || [],
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: ChildRequestDTO = {
      ...formData,
      birthDate: formData.lifeStage === 'BORN' ? formData.birthDate : '',
      age: formData.lifeStage === 'PREGNANCY' ? 0 : formData.age,
    }

    try {
      if (initialData?.id) {
        await childApi.update(initialData.id, payload)
      } else {
        await childApi.create(payload)
      }
      onSuccess()
    } catch (err) {
      console.error(err)
      alert(t('children.form.errorSave')) // Uso de traducción para error
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

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-black text-[#2D2D2D] uppercase italic tracking-tight">
          {initialData
            ? t('children.form.titleEdit')
            : t('children.form.titleNew')}
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
        {/* Etapa de Vida */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            {t('children.form.lifeStageLabel')}
          </label>
          <select
            value={formData.lifeStage}
            onChange={e => {
              const newStage = e.target.value as ChildRequestDTO['lifeStage']
              setFormData({
                ...formData,
                lifeStage: newStage,
                birthDate: newStage === 'PREGNANCY' ? '' : formData.birthDate,
              })
            }}
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="PREGNANCY">
              {t('children.form.lifeStagePregnancy')}
            </option>
            <option value="BORN">{t('children.form.lifeStageBorn')}</option>
          </select>
        </div>

        {/* Género */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            {t('children.form.genderLabel')}
          </label>
          <select
            value={formData.gender || ''}
            onChange={e =>
              setFormData({
                ...formData,
                gender: e.target.value as ChildRequestDTO['gender'],
              })
            }
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="" disabled>
              {t('children.form.genderPlaceholder')}
            </option>
            <option value="BOY">{t('children.form.genderBoy')}</option>
            <option value="GIRL">{t('children.form.genderGirl')}</option>
            <option value="SURPRISE">
              {t('children.form.genderSurprise')}
            </option>
          </select>
        </div>

        {/* Fecha de Nacimiento */}
        {formData.lifeStage === 'BORN' && (
          <div className="space-y-3 md:col-span-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 ml-1">
              <Calendar className="w-4 h-4 text-[#FF8A5C]" />
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {t('children.form.birthDateLabel')}
              </label>
            </div>
            <input
              type="date"
              max={today}
              required={formData.lifeStage === 'BORN'}
              value={formData.birthDate}
              onChange={e =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold transition-all outline-none"
            />
          </div>
        )}
      </div>

      {/* Intereses */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#FF8A5C]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {t('children.form.interestsLabel')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allInterests.map(interest => (
            <button
              key={interest.id}
              type="button"
              onClick={() => toggleInterest(interest.id)}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                formData.interestIds.includes(interest.id)
                  ? 'bg-[#FF8A5C] border-[#FF8A5C] text-white shadow-lg shadow-orange-100'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200'
              }`}
            >
              {/* Traducción dinámica del nombre del interés */}
              {t(`interests.${interest.name.toLowerCase()}`, {
                defaultValue: interest.name,
              })}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-[#2D2D2D] text-white font-black rounded-[1.5rem] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              {initialData
                ? t('children.form.submitUpdate')
                : t('children.form.submitCreate')}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
