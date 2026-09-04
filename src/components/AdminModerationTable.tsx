import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import adminService from '../services/adminService'
import { User } from '../types'
import MainLayout from '../components/layout/MainLayout'
import ModerationThumbnail from '../components/ModerationThumbnail'
import { ArrowLeft, CheckCircle, XCircle, Loader2, Users, Image } from 'lucide-react'
import dashboardBg from '../assets/Verification_image.png'

const AdminModerationTable = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [rejectTarget, setRejectTarget] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getPendingUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching pending users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleVerify = async (userId: number) => {
    const id = Number(userId)
    setActionLoading(id)
    try {
      await adminService.verifyUser(id)
      await fetchUsers()
    } catch {
      toast.error('Failed to verify user.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (rejectTarget === null || !rejectReason.trim()) return
    setActionLoading(rejectTarget)
    try {
      await adminService.rejectUser(rejectTarget, rejectReason.trim())
      await fetchUsers()
    } catch {
      toast.error('Failed to reject user.')
    } finally {
      setActionLoading(null)
      setRejectTarget(null)
      setRejectReason('')
    }
  }

  return (
    <MainLayout
      title="Moderation Panel"
      subtitle="Manage pending family access requests"
      showGlassCard={true}
      backgroundImage={dashboardBg}
    >
      {/* Back Button */}
      <div className="fixed top-8 left-6 z-50">
        <button
          onClick={() => navigate('/admin/stats')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl text-black rounded-full border border-white/20 hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-black text-[10px] uppercase tracking-widest">
            Back to Stats
          </span>
        </button>
      </div>

      {/* Fotos pendientes de revisión */}
      <div className="fixed top-8 right-6 z-50">
        <button
          onClick={() => navigate('/admin/photo-moderation')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl text-black rounded-full border border-white/20 hover:bg-white/20 transition-all"
        >
          <Image className="w-4 h-4" />
          <span className="font-black text-[10px] uppercase tracking-widest">
            Fotos pendientes
          </span>
        </button>
      </div>

      {/* Reject modal */}
      {rejectTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-sm uppercase tracking-widest text-[#2D2D2D] mb-1">
              Rechazar solicitud
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              El usuario recibirá este motivo por email.
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto mt-24 px-4 pb-8">
        {/* TEMPORAL — panel de depuración de URLs, quitar cuando se
            resuelva el problema de las fotos que no cargan. */}
        {!loading && users.length > 0 && (
          <div className="mb-4 bg-black/80 text-lime-300 rounded-2xl p-4 font-mono text-[11px] overflow-x-auto">
            <p className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">
              🔍 Debug — URLs en crudo de los documentos pendientes
            </p>
            {users.map(u => (
              <div key={u.id} className="mb-2 break-all">
                <span className="text-orange-300">#{u.id} {u.email}</span>
                <div>DNI: {u.idDocumentUrl ? u.idDocumentUrl : '⚠️ VACÍO / NULL'}</div>
                <div>Selfie: {u.selfieUrl ? u.selfieUrl : '⚠️ VACÍO / NULL'}</div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-black/70">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="font-black tracking-widest uppercase text-xs">
                Loading requests...
              </span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-black/60">
              <Users className="w-10 h-10" />
              <span className="font-black tracking-widest uppercase text-xs">
                No pending families
              </span>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-white border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 uppercase text-[10px] tracking-widest opacity-70">
                      <th className="p-4 text-left">ID</th>
                      <th className="p-4 text-left">Email</th>
                      <th className="p-4 text-left">Documentos</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 text-xs opacity-50 font-mono">
                          {user.id}
                        </td>
                        <td className="p-4 font-bold text-sm break-all">
                          {user.email}
                        </td>
                        <td className="p-4">
                          {user.idDocumentUrl || user.selfieUrl ? (
                            <div className="flex gap-2">
                              {user.idDocumentUrl && (
                                <a
                                  href={user.idDocumentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Ver documento de identidad"
                                >
                                  <ModerationThumbnail
                                    src={user.idDocumentUrl}
                                    alt="Documento de identidad"
                                    className="w-14 h-14 object-cover rounded-lg border border-white/20 hover:border-[#F28749] transition-colors"
                                  />
                                </a>
                              )}
                              {user.selfieUrl && (
                                <a
                                  href={user.selfieUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Ver selfie"
                                >
                                  <ModerationThumbnail
                                    src={user.selfieUrl}
                                    alt="Selfie"
                                    className="w-14 h-14 object-cover rounded-lg border border-white/20 hover:border-[#F28749] transition-colors"
                                  />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/30 italic">
                              Sin documentos enviados
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              disabled={actionLoading !== null}
                              onClick={() => handleVerify(Number(user.id))}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30 disabled:opacity-40"
                            >
                              {actionLoading === Number(user.id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Verify
                            </button>
                            <button
                              disabled={actionLoading !== null}
                              onClick={() => setRejectTarget(Number(user.id))}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border bg-red-500/20 hover:bg-red-500/40 border-red-500/30 disabled:opacity-40"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-white/10">
                {users.map(user => (
                  <div key={user.id} className="p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">
                        Email
                      </p>
                      <p className="text-sm font-bold text-white break-all">
                        {user.email}
                      </p>
                    </div>
                    {(user.idDocumentUrl || user.selfieUrl) && (
                      <div className="flex gap-2">
                        {user.idDocumentUrl && (
                          <a href={user.idDocumentUrl} target="_blank" rel="noopener noreferrer">
                            <ModerationThumbnail
                              src={user.idDocumentUrl}
                              alt="Documento de identidad"
                              className="w-16 h-16 object-cover rounded-lg border border-white/20"
                            />
                          </a>
                        )}
                        {user.selfieUrl && (
                          <a href={user.selfieUrl} target="_blank" rel="noopener noreferrer">
                            <ModerationThumbnail
                              src={user.selfieUrl}
                              alt="Selfie"
                              className="w-16 h-16 object-cover rounded-lg border border-white/20"
                            />
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleVerify(Number(user.id))}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 text-white disabled:opacity-40 transition-all"
                      >
                        {actionLoading === Number(user.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        Verify
                      </button>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => setRejectTarget(Number(user.id))}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-white disabled:opacity-40 transition-all"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default AdminModerationTable
