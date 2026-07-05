import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, Loader2, User } from 'lucide-react'

interface AvatarUploadProps {
  currentUrl?: string | null
  familyName: string
  onUploaded: (url: string) => void
}

const AvatarUpload = ({
  currentUrl,
  familyName,
  onUploaded,
}: AvatarUploadProps) => {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      setError(t('profile.avatar.errorSize', 'La imagen no puede superar 4MB'))
      return
    }
    if (!file.type.startsWith('image/')) {
      setError(t('profile.avatar.errorType', 'Solo se admiten imágenes'))
      return
    }

    setError('')
    setUploading(true)

    try {

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })


      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 64,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: file.type,
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: 'Is this image appropriate for a family app? Reply only YES or NO.',
                },
              ],
            },
          ],
        }),
      })

      const data = await response.json()
      const verdict = data.content?.[0]?.text?.trim().toUpperCase()

      if (verdict === 'NO') {
        setError(
          t(
            'profile.avatar.errorInappropriate',
            'La imagen no es adecuada para la app',
          ),
        )
        setUploading(false)
        return
      }

 
      const dataUrl = `data:${file.type};base64,${base64}`
      setPreview(dataUrl)
      onUploaded(dataUrl)
    } catch (err) {
      setError(
        t(
          'profile.avatar.errorUpload',
          'Error al subir la imagen. Inténtalo de nuevo.',
        ),
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-24 h-24 rounded-full overflow-hidden bg-orange-100 cursor-pointer group"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt={familyName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-10 h-10 text-orange-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 disabled:opacity-40 transition-colors"
      >
        {uploading
          ? t('profile.avatar.uploading', 'Subiendo...')
          : t('profile.avatar.changePhoto', 'Cambiar foto')}
      </button>

      {error && (
        <p className="text-[11px] text-red-500 font-bold text-center">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default AvatarUpload
