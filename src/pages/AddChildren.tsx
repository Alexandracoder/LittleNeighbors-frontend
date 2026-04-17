import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { childApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { ChildResponseDTO } from '../types'
import ChildForm from '../components/ChildForm'
import ChildCard from '../components/ChildCard'
import {
  Plus,
  ArrowRight,
  Baby,
  Sparkles,
  Heart,
  Users,
  ChevronRight,
} from 'lucide-react'

export default function AddChildPage() {
  const { t } = useTranslation()
  const { refreshStatus } = useAuth()
  const [children, setChildren] = useState<ChildResponseDTO[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<ChildResponseDTO | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadChildren = async () => {
    try {
      setLoading(true)
      const data = await childApi.getAll()
      setChildren(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChildren()
  }, [])

  const handleSuccess = async () => {
    setIsFormOpen(false)
    setEditingChild(null)
    await loadChildren()
    await refreshStatus()
  }

  const handleDelete = async (id: number) => {
    if (window.confirm(t('profile.deleteConfirm'))) {
      try {
        await childApi.delete(id)
        await loadChildren()
        await refreshStatus()
      } catch (err) {
        alert(t('profile.deleteError'))
      }
    }
  }

  const handleEdit = (child: ChildResponseDTO) => {
    setEditingChild(child)
    setIsFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 opacity-10">
        <Sparkles className="w-96 h-96 text-[#FF8A5C]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#FF8A5C] p-2 rounded-xl shadow-lg">
                <Baby className="text-white w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black text-[#2D2D2D] tracking-tight">
                {t('children.page.title')}
              </h1>
            </div>
            <p className="text-gray-500 font-bold ml-1 uppercase tracking-widest text-xs">
              {t('children.page.subtitle')}
            </p>
          </div>

          <button
            onClick={() => navigate('/explore')}
            className="group flex items-center gap-3 px-8 py-4 bg-[#FF8A5C] text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            {t('children.page.startExploring')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-[#FF8A5C] mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {children.map(child => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}

              <button
                onClick={() => {
                  setEditingChild(null)
                  setIsFormOpen(true)
                }}
                className="border-4 border-dashed border-[#FF8A5C]/20 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-[#FF8A5C]/50 hover:bg-white/60 transition-all group min-h-[250px] bg-white/20 backdrop-blur-sm"
              >
                <div className="p-5 bg-white rounded-full group-hover:bg-[#FF8A5C] group-hover:text-white transition-all shadow-xl group-hover:rotate-90 duration-500">
                  <Plus className="w-10 h-10" />
                </div>
                <span className="font-black text-[#FF8A5C]/40 group-hover:text-[#FF8A5C] uppercase tracking-widest text-xs">
                  {t('children.page.addNewProfile')}
                </span>
              </button>
            </div>

            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-6 ml-2">
                <Users className="w-4 h-4 text-[#FF8A5C]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {t('matches.title')}
                </h3>
              </div>

              <button
                onClick={() => navigate('/matches')}
                className="w-full flex items-center justify-between p-6 bg-white rounded-[2.5rem] border border-[#FF8A5C]/10 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Heart className="w-7 h-7 text-pink-500 fill-pink-500/10" />
                  </div>
                  <div className="text-left">
                    <span className="block font-black uppercase italic tracking-tighter text-xl text-[#2D2D2D] leading-none mb-1">
                      {t('dashboard.myPlaydates')}
                    </span>
                    <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      {t('dashboard.subtitle')}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#FF8A5C] group-hover:text-white transition-all">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </button>
            </div>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-[#2D2D2D]/40 backdrop-blur-md"
              onClick={() => {
                setIsFormOpen(false)
                setEditingChild(null)
              }}
            />
            <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="bg-white rounded-[3rem] shadow-2xl border-t-8 border-[#FF8A5C] p-8">
                <ChildForm
                  initialData={editingChild}
                  onSuccess={handleSuccess}
                  onCancel={() => {
                    setIsFormOpen(false)
                    setEditingChild(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
