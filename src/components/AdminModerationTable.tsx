import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import adminService from '../services/adminService'
import { User } from '../types'
import MainLayout from '../components/layout/MainLayout'
import { ArrowLeft } from 'lucide-react'
import dashboardBg from '../assets/Verification_image.png'

const AdminModerationTable = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

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
    } catch (error) {
      alert('Failed to verify user.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (userId: number) => {
    const id = Number(userId)
    const reason = window.prompt('Please enter the reason for rejection:')

    if (reason !== null && reason.trim() !== '') {
      setActionLoading(id)
      try {
        await adminService.rejectUser(id, reason)
        await fetchUsers()
      } catch (error) {
        alert('Failed to reject user.')
      } finally {
        setActionLoading(null)
      }
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
        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl text-white rounded-full border border-white/20 hover:bg-white/20 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-black text-[10px] uppercase tracking-widest">
          Back to Stats
        </span>
      </button>
    </div>

    {/* Main Content */}
    <div className="max-w-4xl mx-auto mt-24 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
      {loading ? (
        <div className="py-20 text-center text-white/70 font-black tracking-widest uppercase text-sm">
          Loading requests...
        </div>
      ) : (
        <table className="w-full text-white border-collapse">
          <thead>
            <tr className="border-b border-white/10 uppercase text-[10px] tracking-widest opacity-70">
              <th className="p-4 text-left">User Email</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="p-10 text-center opacity-60 uppercase tracking-widest text-xs"
                >
                  No pending families.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 font-bold text-sm">{user.email}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleVerify(Number(user.id))}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border ${
                        actionLoading === Number(user.id)
                          ? 'bg-emerald-500/10 opacity-50'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30'
                      }`}
                    >
                      {actionLoading === Number(user.id) ? '...' : 'Verify'}
                    </button>
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleReject(Number(user.id))}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border ${
                        actionLoading === Number(user.id)
                          ? 'bg-red-500/10 opacity-50'
                          : 'bg-red-500/20 hover:bg-red-500/40 border-red-500/30'
                      }`}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  </MainLayout>
)
}

export default AdminModerationTable
