import { useState, useEffect } from 'react';
import { LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { childApi } from '../services/api';
import type { ChildResponseDTO } from '../types';
import ChildCard from './ChildCard';
import ChildForm from './ChildForm';

export default function Dashboard() {
  const [children, setChildren] = useState<ChildResponseDTO[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await childApi.getAll();
      setChildren(data);
    } catch (err) {
      console.error('Failed to fetch children:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this child?')) {
      return;
    }

    try {
      await childApi.delete(id);
      setChildren(children.filter((child) => child.id !== id));
    } catch (err) {
      console.error('Failed to delete child:', err);
    }
  };

  const handleEdit = (child: ChildResponseDTO) => {
    setEditingChild(child);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingChild(null);
  };

  const handleFormSuccess = () => {
    fetchChildren();
    handleFormClose();
  };

  return (
    // 1. Cambiamos el fondo a tu color crema personalizado
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white shadow-sm border-b border-brand-yellow/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {/* 2. Color Coral para el título principal */}
              <h1 className="text-2xl font-bold text-brand-coral">Little Neighbors</h1>
              <p className="text-xs text-brand-dark opacity-70 font-medium">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white font-bold rounded-2xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-brand-dark">Your Children</h2>
            <p className="text-brand-orange font-medium mt-1">Manage your children's profiles</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            // 3. Botón con tu Naranja Atardecer y sombra suave
            className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-bold rounded-2xl hover:bg-brand-coral transition-all shadow-lg shadow-brand-orange/20"
          >
            <Plus className="w-5 h-5" />
            Add Child
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            {/* 4. Spinner con color Naranja */}
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
            <p className="text-brand-dark mt-4 font-medium">Loading neighbors...</p>
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-brand-yellow/20">
            <div className="max-w-md mx-auto">
              {/* 5. El círculo del icono ahora es amarillo sol */}
              <div className="bg-brand-yellow/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-brand-orange" />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-2">No children yet</h3>
              <p className="text-brand-dark/70 mb-6">
                Start by adding your first child to connect with other families in your neighborhood
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-brand-orange text-white font-bold rounded-2xl hover:bg-brand-coral transition-all shadow-md"
              >
                Add Your First Child
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ChildForm
          child={editingChild}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
