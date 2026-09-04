import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import adminService from '../services/adminService'
import { FamilyResponseDTO } from '../types'
import MainLayout from '../components/layout/MainLayout'
import ModerationThumbnail from '../components/ModerationThumbnail'
import { ArrowLeft, CheckCircle, XCircle, Loader2, ImageOff } from 'lucide-react'
import dashboardBg from '../assets/Verification_image.png'

const AdminPhotoModerationTable = () => {
  const navigate = useNavigate()
  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [rejectTarget, setRejectTarget] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchPendingPhotos = async () => {
    setLoading(true)
    try {
      const data = await adminService.getPendingPhotos()
      setFamilies(data)
    } catch (error) {
      console.error('Error fetching pending photos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingPhotos()
  }, [])

  const handleApprove = async (familyId: number) => {
    setActionLoading(familyId)
    try {
      await adminService.approvePhoto(familyId)
      setFamilies(prev => prev.filter(f => f.id !== familyId))
      toast.success('Foto aprobada.')
    } catch {
      toast.error('No se pudo aprobar la foto.')
    } finally {
      setActionLoading(null)
    }
  }

  // Antes rechazaba directamente sin pedir motivo — ahora abre el modal,
  // igual que ya hacía la verificación de identidad, para que la familia
  // sepa qué corregir antes de subir otra foto.
  const handleRejectConfirm = async () => {
    if (rejectTarget === null || !rejectReason.trim()) return
    setActionLoading(rejectTarget)
    try {
      await adminService.rejectPhoto(rejectTarget, rejectReason.trim())
      setFamilies(prev => prev.filter(f => f.id !== rejectTarget))
      toast.success('Foto rechazada.')
    } catch {
      toast.error('No se pudo rechazar la foto.')
    } finally {
      setActionLoading(null)
      setRejectTarget(null)
      setRejectReason('')
    }
  }

  return (
    <MainLayout
      title="Moderación de fotos"
      subtitle="Revisa las fotos de familia antes de que sean visibles para otros"
      showGlassCard={true}
      backgroundImage={dashboardBg}
    >
      <div className="fixed top-8 left-6 z-50">
        <button
          onClick={() => navigate('/admin/moderation')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl text-black rounded-full border border-white/20 hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-black text-[10px] uppercase tracking-widest">
            Volver a moderación
          </span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto mt-24 px-4 pb-8">
        {/* TEMPORAL — panel de depuración de URLs, quitar cuando se
            resuelva el problema de las fotos que no cargan. */}
        {!loading && families.length > 0 && (
          <div className="mb-4 bg-black/80 text-lime-300 rounded-2xl p-4 font-mono text-[11px] overflow-x-auto">
            <p className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">
              🔍 Debug — URLs en crudo de las fotos pendientes
            </p>
            {families.map(f => (
              <div key={f.id} className="mb-1 break-all">
                <span className="text-orange-300">#{f.id} {f.familyName}:</span>{' '}
                {f.profilePictureUrl
                  ? f.profilePictureUrl
                  : '⚠️ VACÍO / NULL — no hay URL guardada'}
              </div>
            ))}
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-black/70">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="font-black tracking-widest uppercase text-xs">
                Cargando fotos pendientes...
              </span>
            </div>
          ) : families.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-black/60">
              <ImageOff className="w-10 h-10" />
              <span className="font-black tracking-widest uppercase text-xs">
                No hay fotos pendientes
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {families.map(family => (
                <div
                  key={family.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
                >
                  <div className="aspect-square w-full bg-black/20">
                    {family.profilePictureUrl ? (
                      <ModerationThumbnail
                        src={family.profilePictureUrl}
                        alt={family.familyName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <ImageOff className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Familia
                      </p>
                      <p className="text-sm font-bold text-white break-words">
                        {family.familyName || family.representativeName}
                      </p>
                      <p className="text-[11px] text-white/50">
                        {family.neighborhoodName}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleApprove(family.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 text-white disabled:opacity-40 transition-all"
                      >
                        {actionLoading === family.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        Aprobar
                      </button>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => setRejectTarget(family.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-white disabled:opacity-40 transition-all"
                      >
                        <XCircle className="w-3 h-3" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {rejectTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-sm uppercase tracking-widest text-[#2D2D2D] mb-1">
              Rechazar foto
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              La familia verá este motivo en su perfil.
            </p>
            <textarea
              autoFocus
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Motivo del rechazo..."
              rows={3}
              className="w-full p-3 text-sm bg-gray-50 border-2 border-transparent focus:border-red-400 rounded-2xl outline-none resize-none font-medium text-[#2D2D2D] mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRejectTarget(null)
                  setRejectReason('')
                }}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                disabled={!rejectReason.trim() || actionLoading !== null}
                onClick={handleRejectConfirm}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {actionLoading !== null ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirmar rechazo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default AdminPhotoModerationTable
