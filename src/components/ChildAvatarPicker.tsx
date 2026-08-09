import { CHILD_AVATARS } from '../utils/childAvatars'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

interface ChildAvatarPickerProps {
  value?: string | null
  onChange: (avatarKey: string) => void
}

export default function ChildAvatarPicker({
  value,
  onChange,
}: ChildAvatarPickerProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
        {t('children.form.avatarLabel', 'Elige un avatar')}
      </label>
      <div className="flex flex-wrap gap-3">
        {CHILD_AVATARS.map(avatar => {
          const selected = value === avatar.key
          return (
            <button
              key={avatar.key}
              type="button"
              onClick={() => onChange(avatar.key)}
              aria-label={t('children.form.avatarSelect', 'Seleccionar este avatar')}
              className={`relative w-16 h-16 rounded-full overflow-hidden transition-all ${
                selected
                  ? 'ring-4 ring-[#FF8A5C] ring-offset-2'
                  : 'ring-2 ring-transparent hover:ring-orange-200'
              }`}
            >
              <img
                src={avatar.src}
                alt=""
                className="w-full h-full object-cover"
              />
              {selected && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-[#FF8A5C] rounded-full p-1">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
