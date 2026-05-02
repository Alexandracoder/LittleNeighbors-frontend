import { useState, useEffect } from 'react'
import { childApi, interestApi, authApi } from '../services/api'
import { useTranslation } from 'react-i18next'
import type {
  ChildRequestDTO,
  ChildResponseDTO,
  InterestResponseDTO,
} from '../types'
import { X, Save, Loader2, Heart, Sparkles } from 'lucide-react'

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
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [allInterests, setAllInterests] = useState<InterestResponseDTO[]>([])

  const [formData, setFormData] = useState<ChildRequestDTO>({
    nickname: '',
    gender: 'BOY',
    lifeStage: 'PREGNANCY',
    age: 0,
    birthDate: '',
    interestIds: [],
    description: '',
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
        nickname: initialData.nickname || '',
        gender: initialData.gender,
        lifeStage: initialData.lifeStage,
        age: initialData.age ?? 0,
        birthDate: initialData.birthDate || '',
        interestIds: initialData.interests?.map(i => i.id) || [],
        description: initialData.description || '',
      })
    }
  }, [initialData])

  const generateMagicNick = () => {
    const adjectives = [
      'Explorador',
      'Artista',
      'Capità',
      'Xicotet',
      'Valent',
      'Alegre',
      'Ràpid',
    ]
    const icons = ['Lleó', 'Dofí', 'Àguila', 'Gat', 'Esquirol', 'Ós', 'Estel']
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomIcon = icons[Math.floor(Math.random() * icons.length)]
    setFormData(prev => ({ ...prev, nickname: `${randomAdj} ${randomIcon}` }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nickname.trim()) return
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
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const refreshData = await authApi.refresh({ refreshToken })
            localStorage.setItem('accessToken', refreshData.accessToken)
            if (refreshData.refreshToken) {
              localStorage.setItem('refreshToken', refreshData.refreshToken)
            }
          } catch (refreshErr) {
            console.error(refreshErr)
          }
        }
      }
      onSuccess()
    } catch (err) {
      console.error(err)
      alert(t('children.form.errorSave'))
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
  const isNicknameEmpty = !formData.nickname.trim()

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
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
          {t('children.form.usernameLabel')}
        </label>
        <div className="relative group">
          <input
            type="text"
            required
            value={formData.nickname}
            onChange={e =>
              setFormData({ ...formData, nickname: e.target.value })
            }
            className={`w-full p-5 border-2 rounded-2xl font-bold outline-none pr-32 text-lg ${
              isNicknameEmpty
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-transparent focus:border-[#FF8A5C]'
            }`}
          />
          <button
            type="button"
            onClick={generateMagicNick}
            className="absolute right-2 top-2 bottom-2 px-4 bg-[#FF8A5C] text-white rounded-xl font-black text-[10px] uppercase hover:bg-[#ff7a45] flex items-center gap-2"
          >
            <Sparkles className="w-3 h-3" />
            {t('children.form.magicButton')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            {t('children.form.lifeStageLabel')}
          </label>
          <select
            value={formData.lifeStage}
            onChange={e =>
              setFormData({ ...formData, lifeStage: e.target.value as any })
            }
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold appearance-none outline-none"
          >
            <option value="PREGNANCY">
              {t('children.form.lifeStagePregnancy')}
            </option>
            <option value="BORN">{t('children.form.lifeStageBorn')}</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            {t('children.form.genderLabel')}
          </label>
          <select
            value={formData.gender}
            onChange={e =>
              setFormData({ ...formData, gender: e.target.value as any })
            }
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold appearance-none outline-none"
          >
            <option value="BOY">{t('children.form.genderBoy')}</option>
            <option value="GIRL">{t('children.form.genderGirl')}</option>
            <option value="SURPRISE">
              {t('children.form.genderSurprise')}
            </option>
          </select>
        </div>

        {formData.lifeStage === 'BORN' && (
          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              {t('children.form.birthDateLabel')}
            </label>
            <input
              type="date"
              max={today}
              value={formData.birthDate}
              onChange={e =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold outline-none"
            />
          </div>
        )}
      </div>

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
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                formData.interestIds.includes(interest.id)
                  ? 'bg-[#FF8A5C] border-[#FF8A5C] text-white shadow-lg'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200'
              }`}
            >
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
          disabled={loading || isNicknameEmpty}
          className="w-full py-5 bg-[#2D2D2D] text-white font-black rounded-[1.5rem] hover:bg-black flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs shadow-xl transition-all"
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
