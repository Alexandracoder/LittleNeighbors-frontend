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
  Loader2,
  AlertCircle,
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
    await refreshStatus() // Crucial para actualizar el estado global de la familia
  }

  const handleDelete = async (id: number) => {
    // Uso del t() para internacionalización del mensaje de confirmación
    if (window.confirm(t('common.deleteConfirm') || 'Are you sure?')) {
      try {
        await childApi.delete(id)
        await loadChildren()
        await refreshStatus()
      } catch (err) {
        console.error('Delete error:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream/20 p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 -z-10 opacity-10 pointer-events-none">
        <Sparkles className="w-96 h-96 text-brand-orange" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand-orange p-2 rounded-xl shadow-lg">
                <Baby className="text-white w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black text-brand-dark tracking-tighter uppercase">
                Little <span className="text-brand-orange">Neighbors</span>
              </h1>
            </div>
            <p className="text-brand-dark/40 font-black uppercase tracking-[0.2em] text-[10px] ml-1">
              {t('onboarding.addChild.title') || 'Manage your family members'}
            </p>
          </div>

          {/* Botón de navegación condicional */}
          <button
            onClick={() => navigate('/explore')}
            disabled={children.length === 0}
            className={`group flex items-center gap-3 px-8 py-4 font-black rounded-2xl transition-all shadow-xl active:scale-95 ${
              children.length > 0
                ? 'bg-brand-dark text-white hover:bg-brand-orange hover:-translate-y-1'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {t('common.next') || 'Start Exploring'}
            <ArrowRight
              className={`w-5 h-5 ${
                children.length > 0
                  ? 'group-hover:translate-x-1 transition-transform'
                  : ''
              }`}
            />
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-brand-orange animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark/30">
              {t('common.loading')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                onEdit={c => {
                  setEditingChild(c)
                  setIsFormOpen(true)
                }}
                onDelete={handleDelete}
              />
            ))}

            {/* Empty State / Add Button */}
            <button
              onClick={() => {
                setEditingChild(null)
                setIsFormOpen(true)
              }}
              className="border-4 border-dashed border-brand-orange/20 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-brand-orange/50 hover:bg-white transition-all group min-h-[280px] bg-white/40 backdrop-blur-sm"
            >
              <div className="p-5 bg-white rounded-full group-hover:bg-brand-orange group-hover:text-white transition-all shadow-xl group-hover:rotate-90 duration-500 text-brand-orange">
                <Plus className="w-10 h-10" />
              </div>
              <span className="font-black text-brand-orange/40 group-hover:text-brand-orange uppercase tracking-widest text-[10px]">
                {t('onboarding.addChild.submitButton') || 'Add New Profile'}
              </span>
            </button>
          </div>
        )}

        {/* Modal Overlay & Container */}
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setIsFormOpen(false)}
            />
            <div className="relative z-10 w-full max-w-xl animate-in zoom-in-95 duration-300">
              <div className="bg-white rounded-[3.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.4)] border-t-[12px] border-brand-orange overflow-hidden">
                <ChildForm
                  child={editingChild}
                  onClose={() => setIsFormOpen(false)}
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          </div>
        )}

        {children.length === 0 && !loading && (
          <div className="mt-12 flex items-center justify-center gap-2 text-brand-orange/60 animate-bounce">
            <AlertCircle className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Add at least one child to start playing
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
