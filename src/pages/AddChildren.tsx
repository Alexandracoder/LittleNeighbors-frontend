import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { childApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { ChildResponseDTO } from '../types'
import ChildForm from '../components/ChildForm'
import ChildCard from '../components/ChildCard'
import { Plus, ArrowRight, Baby, Sparkles } from 'lucide-react'

export default function AddChildPage() {
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
    await refreshStatus() // Actualiza el "semáforo" global
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this profile?')) {
      try {
        await childApi.delete(id)
        await loadChildren()
        await refreshStatus()
      } catch (err) {
        alert('Could not delete profile.')
      }
    }
  }

  const handleEdit = (child: ChildResponseDTO) => {
    setEditingChild(child)
    setIsFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-brand-cream/30 p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 opacity-10">
        <Sparkles className="w-96 h-96 text-brand-orange" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand-orange p-2 rounded-xl shadow-lg">
                <Baby className="text-white w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black text-brand-dark tracking-tight">
                Little Neighbors
              </h1>
            </div>
            <p className="text-gray-500 font-bold ml-1 uppercase tracking-widest text-xs">
              Manage your family members
            </p>
          </div>

          <button
            onClick={() => navigate('/explore')}
            className="group flex items-center gap-3 px-8 py-4 bg-brand-orange text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            Start Exploring
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-brand-orange mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tarjetas de los niños que ya existen */}
            {children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {/* Botón para abrir el formulario y añadir uno nuevo */}
            <button
              onClick={() => {
                setEditingChild(null)
                setIsFormOpen(true)
              }}
              className="border-4 border-dashed border-brand-orange/20 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-brand-orange/50 hover:bg-white/60 transition-all group min-h-[250px] bg-white/20 backdrop-blur-sm"
            >
              <div className="p-5 bg-white rounded-full group-hover:bg-brand-orange group-hover:text-white transition-all shadow-xl group-hover:rotate-90 duration-500">
                <Plus className="w-10 h-10" />
              </div>
              <span className="font-black text-brand-orange/40 group-hover:text-brand-orange uppercase tracking-widest text-xs">
                Add New Profile
              </span>
            </button>
          </div>
        )}

        {/* Modal del Formulario: Solo aparece si isFormOpen es true */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md"
              onClick={() => setIsFormOpen(false)}
            />
            <div className="relative z-10 w-full max-w-xl">
              <div className="bg-white rounded-[3rem] shadow-2xl border-t-8 border-brand-orange overflow-hidden">
                <ChildForm
                  child={editingChild}
                  onClose={() => setIsFormOpen(false)}
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
