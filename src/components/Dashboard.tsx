import { useState, useEffect } from 'react'
import { LogOut, Plus, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { childApi } from '../services/api'
import type { ChildResponseDTO } from '../types'
import ChildCard from './ChildCard'
import ChildForm from './ChildForm'
import movingBg from '../assets/moving.png'

export default function Dashboard() {
  const [children, setChildren] = useState<ChildResponseDTO[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<ChildResponseDTO | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const { logout, user } = useAuth()

  const fetchChildren = async () => {
    try {
      setLoading(true)
      const data = await childApi.getAll()
      setChildren(data)
    } catch (err) {
      console.error('Failed to fetch children:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this child?')) return
    try {
      await childApi.delete(id)
      setChildren(children.filter(child => child.id !== id))
    } catch (err) {
      console.error('Failed to delete child:', err)
    }
  }

  const handleEdit = (child: ChildResponseDTO) => {
    setEditingChild(child)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingChild(null)
  }

  const handleFormSuccess = () => {
    fetchChildren()
    handleFormClose()
  }

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-brand-cream">
      {/* --- CAPA 1: IMAGEN DE FONDO FIXED (Menos blur, como el login) --- */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${movingBg})`,
          backgroundAttachment: 'fixed',
          filter: 'blur(1.5px) brightness(0.9)', // Ajustado para ser sutil
        }}
      />

      {/* Overlay suave para legibilidad */}
      <div className="fixed inset-0 bg-brand-cream/10 z-0" />

      {/* --- CAPA 2: CONTENIDO (z-10) --- */}
      <div className="relative z-10">
        {/* HEADER ESTILO CRISTAL */}
        <header className="bg-white/70 backdrop-blur-md sticky top-0 z-30 border-b border-brand-orange/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-brand-orange p-2 rounded-xl shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-brand-coral leading-none">
                    Little Neighbors
                  </h1>
                  <p className="text-[10px] text-brand-dark opacity-60 font-bold uppercase tracking-wider mt-1">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white font-bold rounded-2xl transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* TÍTULO Y BOTÓN DE COMUNIDAD (Cambiado ADD CHILD por FIND PLAYMATES) */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 p-8 rounded-[3rem] backdrop-blur-md border border-white/60 shadow-xl">
            <div>
              <h2 className="text-4xl font-extrabold text-brand-dark tracking-tight">
                Your Family
              </h2>
              <p className="text-brand-orange font-bold text-lg mt-1">
                Welcome to your neighborhood dashboard!
              </p>
            </div>

            <button
              onClick={() => alert('Coming soon: Neighborhood explorer!')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-brand-coral text-brand-coral font-black rounded-2xl hover:bg-brand-coral hover:text-white transition-all shadow-lg hover:-translate-y-1 active:scale-95"
            >
              <Users className="w-6 h-6" />
              <span>FIND PLAYMATES</span>
            </button>
          </div>

          {/* LISTADO O ESTADOS */}
          <div className="relative">
            {loading ? (
              <div className="text-center py-20 bg-white/20 backdrop-blur-sm rounded-[3rem]">
                <div className="inline-block animate-spin rounded-full h-14 w-14 border-t-4 border-brand-orange"></div>
                <p className="text-brand-dark mt-6 font-bold text-xl">
                  Loading neighbors...
                </p>
              </div>
            ) : children.length === 0 ? (
              /* --- TARJETA DE ESTADO VACÍO COMPACTA --- */
              <div className="flex justify-center py-10">
                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 text-center border-2 border-white max-w-sm w-full transition-transform hover:scale-[1.01]">
                  <div className="max-w-xs mx-auto">
                    <div className="bg-brand-yellow/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Plus className="w-8 h-8 text-brand-orange" />
                    </div>
                    <h3 className="text-xl font-black text-brand-dark mb-2 tracking-tight">
                      Empty Nest?
                    </h3>
                    <p className="text-brand-dark/70 mb-6 text-sm font-medium leading-relaxed">
                      Add your children to start connecting with other families
                      in your neighborhood!
                    </p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full py-4 bg-brand-orange text-white font-black rounded-2xl hover:bg-brand-coral transition-all shadow-xl text-sm uppercase tracking-widest"
                    >
                      Add First Child
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- GRID DE TARJETAS + BOTÓN RÁPIDO --- */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {children.map(child => (
                  <div
                    key={child.id}
                    className="transform hover:scale-[1.03] transition-all duration-300"
                  >
                    <ChildCard
                      child={child}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}

                {/* Botón rápido para añadir más al final de la lista */}
                <button
                  onClick={() => setShowForm(true)}
                  className="group h-full min-h-[220px] border-4 border-dashed border-brand-orange/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-brand-orange/50 hover:bg-white/30 transition-all duration-300"
                >
                  <div className="bg-brand-orange/10 p-4 rounded-full group-hover:bg-brand-orange/20 transition-all">
                    <Plus className="w-8 h-8 text-brand-orange" />
                  </div>
                  <span className="font-bold text-brand-orange uppercase tracking-widest text-sm">
                    Add another child
                  </span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL FORMULARIO: Estilo "Warm Neighborhood" */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all">
          {/* 1. Fondo oscurecido con blur extra para concentrar la atención */}
          <div
            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md animate-in fade-in duration-500"
            onClick={handleFormClose} // Cierra al hacer clic fuera
          />

          {/* 2. La "Caja" del Formulario */}
          <div className="relative z-10 w-full max-w-lg transform animate-in fade-in zoom-in duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl border-t-8 border-brand-orange overflow-hidden flex flex-col max-h-[90vh]">
              {/* Contenedor con scroll interno */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <ChildForm
                  child={editingChild}
                  onClose={handleFormClose}
                  onSuccess={handleFormSuccess}
                />
              </div>

              <div className="bg-brand-cream/30 py-3 text-center border-t border-brand-yellow/10">
                <p className="text-[9px] text-brand-dark/40 font-bold uppercase tracking-widest">
                  Little Neighbors • Family Profile
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}