import { useState, useEffect } from 'react'
import { childApi, interestApi, authApi } from '../services/api'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type {
  ChildRequestDTO,
  ChildResponseDTO,
  InterestResponseDTO,
} from '../types'
import { X, Save, Loader2, Heart, Sparkles, AlignLeft } from 'lucide-react'

interface ChildFormProps {
  initialData?: ChildResponseDTO | null
  onSuccess: (newChildId?: number) => void
  onCancel: () => void
}

export default function ChildForm({
  initialData,
  onSuccess,
  onCancel,
}: ChildFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
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

  // Función para traducir las claves "adjective_noun" para mostrar al usuario
  const getTranslatedNickname = (nick: string) => {
    if (!nick || !nick.includes('_')) return nick
    const [adj, icon] = nick.split('_')
    return `${t(`nicknames.adjectives.${adj}`, { defaultValue: adj })} ${t(
      `nicknames.nouns.${icon}`,
      { defaultValue: icon },
    )}`
  }

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
        nickname: initialData.nickname || '',
        gender: initialData.gender,
        lifeStage: initialData.lifeStage as any,
        age: initialData.age ?? 0,
        birthDate: initialData.birthDate || '',
        interestIds: initialData.interests?.map(i => i.id) || [],
        description: initialData.description || '',
      })
    }
  }, [initialData])

  const generateMagicNick = () => {
    const adjectives = [
      'magic',
      'brave',
      'creative',
      'explorer',
      'artist',
      'captain',
      'happy',
      'shiny',
      'curious',
      'little',
    ]
    const icons = [
      'lion',
      'star',
      'dolphin',
      'fox',
      'bear',
      'wizard',
      'koala',
      'astronaut',
      'rocket',
      'eagle',
    ]

    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomIcon = icons[Math.floor(Math.random() * icons.length)]

    // Guardamos la clave técnica en el estado
    setFormData(prev => ({
      ...prev,
      nickname: `${randomAdj}_${randomIcon}`,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const sanitizedNickname = formData.nickname.trim()
    if (!sanitizedNickname) return

    setLoading(true)

    const payload: ChildRequestDTO = {
      ...formData,
      nickname: sanitizedNickname,
      birthDate: formData.lifeStage === 'BORN' ? formData.birthDate : '',
      age: formData.lifeStage === 'PREGNANCY' ? 0 : Number(formData.age),
    }

    try {
      let savedChild: ChildResponseDTO

      if (initialData?.id) {
        savedChild = await childApi.update(initialData.id, payload)
      } else {
        savedChild = await childApi.create(payload)

        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const refreshData = await authApi.refresh({ refreshToken })
            localStorage.setItem('accessToken', refreshData.accessToken)
            if (refreshData.refreshToken) {
              localStorage.setItem('refreshToken', refreshData.refreshToken)
            }
          } catch (refreshErr) {
            console.warn(
              'Token refresh synchronization side-stepped:',
              refreshErr,
            )
          }
        }
      }

      if (savedChild && savedChild.id) {
        navigate(`/child/${savedChild.id}`)
      } else {
        onSuccess(savedChild?.id)
      }
    } catch (err) {
      console.error(
        'Save error occurred during child profile persistence:',
        err,
      )
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
            placeholder={t('children.form.nicknamePlaceholder')}
            // Mostramos el nombre traducido, pero el valor real sigue siendo la clave técnica
            value={getTranslatedNickname(formData.nickname)}
            onChange={e =>
              setFormData({ ...formData, nickname: e.target.value })
            }
            className={`w-full p-5 border-2 rounded-2xl font-bold outline-none pr-32 text-lg transition-all ${
              isNicknameEmpty
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-transparent focus:border-[#FF8A5C] focus:bg-white'
            }`}
          />
          <button
            type="button"
            onClick={generateMagicNick}
            className="absolute right-2 top-2 bottom-2 px-4 bg-[#FF8A5C] text-white rounded-xl font-black text-[10px] uppercase hover:bg-[#ff7a45] flex items-center gap-2 shadow-sm transition-transform active:scale-95"
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
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold appearance-none outline-none cursor-pointer"
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
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold appearance-none outline-none cursor-pointer"
          >
            <option value="BOY">{t('children.form.genderBoy')}</option>
            <option value="GIRL">{t('children.form.genderGirl')}</option>
            <option value="SURPRISE">
              {t('children.form.genderSurprise')}
            </option>
          </select>
        </div>

        {formData.lifeStage === 'BORN' && (
          <div className="space-y-3 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              {t('children.form.birthDateLabel')}
            </label>
            <input
              type="date"
              max={today}
              required={formData.lifeStage === 'BORN'}
              value={formData.birthDate}
              onChange={e =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl font-bold outline-none"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 ml-1">
          <AlignLeft className="w-4 h-4 text-[#FF8A5C]" />
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {t('children.form.bioLabel')}
          </label>
        </div>
        <textarea
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder={t('children.form.bioPlaceholder')}
          className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] focus:bg-white rounded-2xl font-bold outline-none min-h-[120px] transition-all"
        />
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
          className="w-full py-5 bg-[#2D2D2D] text-white font-black rounded-[1.5rem] hover:bg-black flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-[0.98]"
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
