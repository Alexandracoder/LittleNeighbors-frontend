import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { childApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { ChildResponseDTO } from '../types'
import ChildForm from '../components/ChildForm'
import ChildCard from '../components/ChildCard'
import { Plus, ArrowRight, Baby, Sparkles, Loader2 } from 'lucide-react'

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
      console.error('Error loading children:', err)
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
    if (
      window.confirm(
        t(
          'dashboard.children.deleteConfirm',
          'Estàs segur que vols eliminar aquest xiquet?',
        ),
      )
    ) {
      try {
        await childApi.delete(id)
        await loadChildren()
        await refreshStatus()
      } catch (err) {
        alert(t('common.error', "No s'ha pogut eliminar el xiquet"))
      }
    }
  }

  const handleEdit = (child: ChildResponseDTO) => {
    setEditingChild(child)
    setIsFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-brand-cream/20 p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 -z-10 opacity-5 pointer-events-none">
        <Sparkles className="w-[500px] h-[500px] text-brand-orange" />
      </div>
      <div className="absolute -bottom-24 -left-24 -z-10 opacity-5 pointer-events-none bg-brand-orange w-96 h-96 rounded-full blur-[120px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-brand-orange p-3 rounded-2xl shadow-[0_10px_30px_rgba(255,145,77,0.3)]">
                <Baby className="text-white w-10 h-10" />
              </div>
              <h1 className="text-5xl font-black text-brand-dark tracking-tighter uppercase">
                Xiquets <span className="text-brand-orange">del Barri</span>
              </h1>
            </div>
            <p className="text-brand-dark/40 font-black ml-1 uppercase tracking-[0.3em] text-[10px]">
              {t('dashboard.hero.subtitle')}
            </p>
          </div>

          <button
            onClick={() => navigate('/explore')}
            className="group flex items-center gap-4 px-10 py-5 bg-brand-dark text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl hover:bg-brand-orange hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            {t('dashboard.actions.findPlaymates')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin h-12 w-12 text-brand-orange" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-dark/20">
              {t('common.loading')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
              className="group relative border-4 border-dashed border-brand-orange/20 rounded-[3.5rem] p-12 flex flex-col items-center justify-center gap-6 hover:border-brand-orange/50 hover:bg-white transition-all min-h-[320px] bg-white/30 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 bg-white rounded-[2rem] text-brand-orange shadow-xl group-hover:bg-brand-orange group-hover:text-white transition-all duration-500 group-hover:scale-110 z-10">
                <Plus className="w-12 h-12" />
              </div>

              <div className="text-center z-10">
                <span className="block font-black text-brand-orange uppercase tracking-[0.2em] text-[11px] mb-1">
                  {t('dashboard.children.addAnotherButton')}
                </span>
                <span className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest">
                  {t('child.form.titleCreate')}
                </span>
              </div>
            </button>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-xl animate-in fade-in duration-300"
              onClick={() => setIsFormOpen(false)}
            />
            <div className="relative z-10 w-full max-w-xl animate-in zoom-in-95 duration-300">
              <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border-t-[12px] border-brand-orange overflow-hidden">
                <div className="p-2">
                  <ChildForm
                    child={editingChild}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleSuccess}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
