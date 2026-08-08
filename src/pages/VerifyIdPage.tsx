import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../services/api'
import {
  uploadVerificationDocument,
  isVerificationUploadConfigured,
  ImageUploadError,
} from '../services/imageUpload'
import MainLayout from '../components/layout/MainLayout'
import { ShieldCheck, ShieldAlert, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import bgImage from '../assets/littleneighbor_playing.png'

export default function VerifyIdPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { status, refreshStatus } = useAuth()

  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)

  const verificationStatus = status?.verificationStatus

  const handleSubmit = async () => {
    setError(null)

    if (!idDocumentFile || !selfieFile) {
      setError(
        t(
          'verifyId.missingFiles',
          'Sube las dos fotos: el documento y el selfie.',
        ),
      )
      return
    }

    if (!isVerificationUploadConfigured()) {
      setError(
        t(
          'verifyId.notConfigured',
          'La verificación no está disponible todavía. Inténtalo más tarde.',
        ),
      )
      return
    }

    setSubmitting(true)
    try {
      const [idDocumentUrl, selfieUrl] = await Promise.all([
        uploadVerificationDocument(idDocumentFile),
        uploadVerificationDocument(selfieFile),
      ])

      await userApi.submitVerification(idDocumentUrl, selfieUrl)
      await refreshStatus()
      setJustSubmitted(true)
    } catch (err) {
      setError(
        err instanceof ImageUploadError
          ? err.message
          : t(
              'verifyId.genericError',
              'No se pudo enviar la verificación. Inténtalo de nuevo.',
            ),
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Ya verificada, o recién enviada en esta misma sesión: no tiene sentido
  // seguir mostrando el formulario de subida.
  const showPendingState =
    justSubmitted || verificationStatus === 'PENDING_REVIEW'
  const showVerifiedState = verificationStatus === 'VERIFIED'

  return (
    <MainLayout
      backgroundImage={bgImage}
      title={t('verifyId.title', 'Verifica tu identidad')}
      subtitle={t(
        'verifyId.subtitle',
        'Solo para que las familias del barrio sepan que sois quienes decís ser.',
      )}
      showGlassCard={false}
    >
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 sm:p-8 mt-4">
        {showVerifiedState ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-black text-gray-900 uppercase mb-2">
              {t('verifyId.alreadyVerified', '¡Ya estás verificada!')}
            </h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-6 py-3 bg-[#F28749] text-white rounded-2xl font-black uppercase text-xs tracking-widest"
            >
              {t('common.back', 'Volver')}
            </button>
          </div>
        ) : showPendingState ? (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-[#F28749] mx-auto mb-4 animate-spin" />
            <h2 className="text-lg font-black text-gray-900 uppercase mb-2">
              {t('verifyId.pendingTitle', 'Revisando tu solicitud')}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {t(
                'verifyId.pendingBody',
                'Un admin la revisará en breve. Te avisaremos en cuanto esté aprobada.',
              )}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase text-xs tracking-widest"
            >
              {t('common.back', 'Volver')}
            </button>
          </div>
        ) : (
          <>
            {verificationStatus === 'REJECTED' && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-700">
                  {t(
                    'verifyId.rejectedNotice',
                    'Tu verificación anterior no se pudo aprobar. Puedes volver a intentarlo con fotos más claras.',
                  )}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#F28749]/10 p-3 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-[#F28749]" />
              </div>
              <p className="text-xs font-medium text-gray-500">
                {t(
                  'verifyId.explanation',
                  'Necesitamos una foto de tu documento de identidad y un selfie tuyo. Un admin los revisa a mano y los borramos en cuanto se resuelve — no los guardamos más tiempo del necesario.',
                )}
              </p>
            </div>

            <div className="space-y-4">
              <FileField
                label={t('verifyId.idDocumentLabel', 'Foto del DNI o carnet')}
                file={idDocumentFile}
                onChange={setIdDocumentFile}
              />
              <FileField
                label={t('verifyId.selfieLabel', 'Selfie tuyo')}
                file={selfieFile}
                onChange={setSelfieFile}
              />
            </div>

            {error && (
              <p className="mt-4 text-xs font-bold text-red-600 text-center">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 py-4 bg-[#F28749] hover:bg-[#e0763d] disabled:opacity-50 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {t('verifyId.submitBtn', 'Enviar para revisión')}
            </button>

            <button
              onClick={() => {
                // Solo evita que el onboarding vuelva a insistir en cada
                // login — no cambia nada en el backend. La persona sigue
                // pudiendo verificarse cuando quiera desde aquí mismo o
                // desde el banner de Explorar.
                localStorage.setItem('ln_verify_prompt_dismissed', 'true')
                navigate('/dashboard')
              }}
              className="w-full mt-3 py-3 text-gray-400 hover:text-gray-600 font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              {t('verifyId.skipForNow', 'Más tarde')}
            </button>
          </>
        )}
      </div>
    </MainLayout>
  )
}

function FileField({
  label,
  file,
  onChange,
}: {
  label: string
  file: File | null
  onChange: (file: File | null) => void
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block mb-2">
        {label}
      </span>
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-[#F28749] transition-colors">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          id={label}
          onChange={e => onChange(e.target.files?.[0] ?? null)}
        />
        <label htmlFor={label} className="cursor-pointer block">
          {file ? (
            <span className="text-xs font-bold text-emerald-600">
              ✓ {file.name}
            </span>
          ) : (
            <span className="text-xs font-bold text-gray-400">
              Toca para elegir una foto
            </span>
          )}
        </label>
      </div>
    </label>
  )
}
