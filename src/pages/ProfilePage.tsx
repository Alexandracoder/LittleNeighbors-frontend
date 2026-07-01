import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { familyApi } from '../services/api'
import { FamilyResponseDTO, FamilyRequestDTO } from '../types'
import MainLayout from '../components/layout/MainLayout'
import {
  ArrowLeft,
  User,
  MapPin,
  Edit2,
  Loader2,
  CheckCircle,
  Home,
} from 'lucide-react'
import profileBg from '../assets/neighborhood-picnic.png'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [family, setFamily] = useState<FamilyResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<Partial<FamilyRequestDTO>>({})

  const STATUS_LABELS: Record<string, string> = {
    PREGNANT: t('profile.status.pregnant', 'Embarazo'),
    NEW_PARENTS: t('profile.status.newParents', 'Nuevos padres'),
    ESTABLISHED_FAMILY: t('profile.status.established', 'Familia establecida'),
    SURPRISE: t('profile.status.surprise', 'Sorpresa en camino'),
  }

  useEffect(() => {
    familyApi
      .getMyFamily()
      .then(data => {
        setFamily(data)
        setForm({
          representativeName: data.representativeName,
          familyName: data.familyName,
          description: data.description,
          status: data.status,
          familyInterests: data.familyInterests,
          profilePictureUrl: data.profilePictureUrl,
          neighborhoodId: data.neighborhoodId,
        })
      })
      .catch(err => console.error('Error loading family profile:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!family) return
    setSaving(true)
    try {
      const updated = await familyApi.update(
        family.id,
        form as FamilyRequestDTO,
      )
      setFamily(updated)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Error updating family profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FDF8F3]">
        <div className="w-12 h-12 border-4 border-[#F28749] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!family) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FDF8F3]">
        <p className="text-gray-400 font-bold">
          {t('profile.notFound', 'No se encontró el perfil familiar.')}
        </p>
      </div>
    )
  }

  return (
    <MainLayout
      title={t('profile.title', 'Mi Perfil')}
      subtitle={t('profile.subtitle', 'Datos de tu familia')}
      showGlassCard={false}
      backgroundImage={profileBg}
    >
      <div className="fixed top-8 left-6 z-50">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-xl text-[#2D2D2D] rounded-full border border-gray-200 hover:bg-white transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-black text-[10px] uppercase tracking-widest">
            {t('common.back', 'Volver')}
          </span>
        </button>
      </div>

      <div className="max-w-lg mx-auto mt-24 px-4 pb-12 space-y-4">
        {/* Card principal */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
          <div className="bg-[#2D2D2D] px-6 py-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-3 overflow-hidden">
              {family.profilePictureUrl ? (
                <img
                  src={family.profilePictureUrl}
                  alt={family.familyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-9 h-9 text-orange-500" />
              )}
            </div>
            <h2 className="text-white font-black text-lg uppercase tracking-tight">
              {family.familyName}
            </h2>
            <p className="text-white/50 text-xs font-bold mt-1">
              {STATUS_LABELS[family.status] ?? family.status}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {!editing ? (
              <>
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {t('profile.representative', 'Representante familiar')}
                    </p>
                    <p className="text-sm font-bold text-[#2D2D2D] mt-0.5">
                      {family.representativeName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {t('profile.neighborhood', 'Barrio')}
                    </p>
                    <p className="text-sm font-bold text-[#2D2D2D] mt-0.5">
                      {family.neighborhoodName ||
                        family.neighborhood?.name ||
                        '—'}
                    </p>
                  </div>
                </div>

                {family.description && (
                  <div className="flex items-start gap-3">
                    <Home className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {t('profile.aboutUs', 'Sobre nosotros')}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                        {family.description}
                      </p>
                    </div>
                  </div>
                )}

                {family.familyInterests?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {family.familyInterests.map(interest => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wide rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setEditing(true)}
                  className="w-full mt-2 py-3.5 bg-gray-50 hover:bg-gray-100 text-[#2D2D2D] font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {t('profile.editButton', 'Editar perfil')}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                    {t('profile.representative', 'Representante familiar')}
                  </label>
                  <input
                    value={form.representativeName ?? ''}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        representativeName: e.target.value,
                      }))
                    }
                    className="w-full p-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl text-sm font-bold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                    {t('profile.familyName', 'Nombre de familia')}
                  </label>
                  <input
                    value={form.familyName ?? ''}
                    onChange={e =>
                      setForm(f => ({ ...f, familyName: e.target.value }))
                    }
                    className="w-full p-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl text-sm font-bold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                    {t('profile.aboutUs', 'Sobre nosotros')}
                  </label>
                  <textarea
                    rows={3}
                    value={form.description ?? ''}
                    onChange={e =>
                      setForm(f => ({ ...f, description: e.target.value }))
                    }
                    className="w-full p-3.5 bg-gray-50 border-2 border-transparent focus:border-[#FF8A5C] rounded-2xl text-sm font-medium outline-none resize-none transition-all"
                  />
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed bg-gray-50 p-3 rounded-xl">
                  {t(
                    'profile.neighborhoodLockedNote',
                    'El barrio no se puede cambiar desde aquí — contacta con soporte si necesitas actualizarlo.',
                  )}
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="flex-1 py-3.5 border-2 border-gray-200 text-gray-400 font-black rounded-2xl text-xs uppercase tracking-widest hover:border-gray-300 transition-all disabled:opacity-40"
                  >
                    {t('common.cancel', 'Cancelar')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3.5 bg-[#2D2D2D] text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      t('common.save', 'Guardar')
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Toast guardado */}
        {saved && (
          <div className="flex items-center gap-2 justify-center p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600 text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            {t('profile.savedToast', 'Perfil actualizado correctamente')}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ProfilePage
