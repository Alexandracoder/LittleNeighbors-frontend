import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { childApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { ChildResponseDTO } from '../types'
import ChildForm from '../components/ChildForm'
import ChildCard from '../components/ChildCard'
import ConfirmModal from '../components/ui/ConfirmModal'
import { Plus, ArrowRight, Baby, Sparkles } from 'lucide-react'

export default function AddChildPage() {
  const { t } = useTranslation()
const { refreshStatus, refreshProfile, updateSession } = useAuth()
  const navigate = useNavigate()

  const [children, setChildren] = useState<ChildResponseDTO[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<ChildResponseDTO | null>(
    null,
  )
  const [loading, setLoading] = useState(true)


  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    childId: number | null
  }>({
    isOpen: false,
    childId: null,
  })

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
  const wasEditing = !!editingChild
  setIsFormOpen(false)
  setEditingChild(null)

  try {
    setLoading(true)

    
    await updateSession()

    const updatedChildren = await childApi.getAll()
    setChildren(updatedChildren)


    if (!wasEditing) {
      navigate('/explore', { replace: true })
    }
  } catch (err) {
    console.error('Error in post-save child session sync:', err)
  } finally {
    setLoading(false)
  }
}

  const handleDeleteClick = (id: number) => {
    setDeleteModal({ isOpen: true, childId: id })
  }


  const executeDelete = async () => {
    if (!deleteModal.childId) return

    try {
      await childApi.delete(deleteModal.childId)
      await loadChildren()
      await refreshStatus()
      await refreshProfile()
    } catch (err) {
      alert(t('profile.deleteError'))
    } finally {
      setDeleteModal({ isOpen: false, childId: null })
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
                  onDelete={handleDeleteClick}
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
          </div>
        )}

        {/* Modal para Crear/Editar Niño */}
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

        {/* Modal de Confirmación de Borrado */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title={t('profile.deleteTitle') || '¿Eliminar perfil?'}
          message={
            t('profile.deleteConfirm') || 'Esta acción no se puede deshacer.'
          }
          confirmText={t('common.delete') || 'Eliminar'}
          cancelText={t('common.cancel') || 'Cancelar'}
          onConfirm={executeDelete}
          onCancel={() => setDeleteModal({ isOpen: false, childId: null })}
        />
      </div>
    </div>
  )
}

