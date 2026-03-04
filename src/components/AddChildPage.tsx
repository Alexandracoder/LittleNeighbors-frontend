import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { childApi } from '../services/api'
import type { ChildResponseDTO } from '../types'
import ChildForm from './ChildForm'
import ChildCard from './ChildCard'
import { Plus, ArrowRight, Baby } from 'lucide-react'

export default function AddChildPage() {
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
    } catch (err) {
      console.error('Error loading children:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChildren()
  }, [])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this profile?')) {
      try {
        await childApi.delete(id)
        setChildren(prev => prev.filter(c => c.id !== id))
      } catch (err) {
        alert('Could not delete child profile. Please try again.')
      }
    }
  }

  const handleEdit = (child: ChildResponseDTO) => {
    setEditingChild(child)
    setIsFormOpen(true)
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setEditingChild(null)
    loadChildren() // Recarga la lista para ver los cambios
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Baby className="text-orange-500 w-10 h-10" /> Your Little
              Neighbors
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Add or manage your children's profiles
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-black rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-transparent hover:border-orange-100"
          >
            Go to Dashboard{' '}
            <ArrowRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </header>

        {loading && children.length === 0 ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {/* Botón para añadir nuevo */}
            <button
              onClick={() => {
                setEditingChild(null)
                setIsFormOpen(true)
              }}
              className="border-4 border-dashed border-gray-200 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-orange-300 hover:bg-orange-50/50 transition-all group min-h-[250px]"
            >
              <div className="p-5 bg-gray-100 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                <Plus className="w-10 h-10" />
              </div>
              <span className="font-black text-gray-400 group-hover:text-orange-500 uppercase tracking-widest text-sm">
                Add Child
              </span>
            </button>
          </div>
        )}

        {/* Modal del Formulario (se abre para Crear o Editar) */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
              <ChildForm
                child={editingChild}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
