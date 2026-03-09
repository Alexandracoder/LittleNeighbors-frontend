import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { familyApi, neighborhoodApi } from '../services/api'
import type { NeighborhoodResponseDTO } from '../types'
import { Users, MapPin, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import familyBg from '../assets/create-family.png'

export default function CreateFamily() {
  const [familyName, setFamilyName] = useState('')
  const [description, setDescription] = useState('')
  const [neighborhoodId, setNeighborhoodId] = useState<number>(0)
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodResponseDTO[]>(
    [],
  )
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { updateSession } = useAuth()

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const data = await neighborhoodApi.getAll()
        setNeighborhoods(data)
      } catch (err) {
        console.error('Error fetching neighborhoods:', err)
      }
    }
    fetchNeighborhoods()
  }, [])

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  if (neighborhoodId === 0) {
    setError('Please select a neighborhood before continuing.')
    return
  }

  setLoading(true)
  setError(null)

  try {
    // 1. Crear la familia (asegúrate de que los campos coincidan con tu backend)
    const response = await familyApi.create({
      familyName,
      description,
      neighborhoodId,
      // Nota: Si el backend requiere nombre, obténlo del AuthContext
      representativeName: 'User',
      profilePictureUrl: '',
    })

    // 2. Actualizar sesión global: Esto es vital para el ProtectedRoute
    // El AuthContext debe reconocer ahora que el usuario tiene una familia activa.
    updateSession(response.accessToken, response.refreshToken, response.family)

    // 3. Flujo obligatorio: Redirección al siguiente nodo del diagrama (Añadir hijos)
    // El { replace: true } evita que el usuario pueda volver al formulario de familia con 'atrás'
    navigate('/add-child', { replace: true })
  } catch (err: any) {
    console.error('Error in creation flow:', err)
    setError(
      err.response?.data?.message || 'Failed to initialize family profile',
    )
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-brand-dark">
      {/* FONDO CONSTRUIDO PARA SER VISIBLE */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${familyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: showForm ? 'blur(8px) brightness(0.5)' : 'brightness(0.8)',
          transform: showForm ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      {/* CONTENIDO PRINCIPAL SOBRE EL FONDO */}
      <div className="relative z-20 w-full max-w-2xl">
        {!showForm ? (
          /* PANTALLA DE BIENVENIDA */
          <div className="text-center animate-in fade-in zoom-in duration-700 flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-xl p-6 rounded-full mb-8 shadow-2xl border border-white/30">
              <Sparkles className="w-16 h-16 text-brand-orange animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] italic uppercase tracking-tighter">
              Almost there...
            </h1>
            <p className="text-xl md:text-2xl text-white font-bold mb-10 drop-shadow-md max-w-md">
              Let's set up your family profile to start meeting neighbors.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-4 px-12 py-6 bg-brand-orange text-white font-black rounded-full text-2xl shadow-[0_20px_50px_rgba(234,88,12,0.3)] hover:bg-white hover:text-brand-orange transition-all transform hover:-translate-y-2"
            >
              <span>GET STARTED</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform w-8 h-8" />
            </button>
          </div>
        ) : (
          /* FORMULARIO ESTILO DASHBOARD */
          <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border-t-[12px] border-brand-orange animate-in slide-in-from-bottom-20 duration-500">
            <div className="mb-10 text-center">
              <div className="bg-brand-orange/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-brand-orange w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">
                Family Details
              </h2>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-2">
                Create your identity
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-brand-dark ml-2">
                  Family Name
                </label>
                <input
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  className="w-full p-5 bg-gray-100 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-3xl outline-none transition-all font-medium"
                  placeholder="e.g. The Smith Family"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-brand-dark ml-2">
                  Your Neighborhood
                </label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange w-6 h-6" />
                  <select
                    value={neighborhoodId}
                    onChange={e => setNeighborhoodId(Number(e.target.value))}
                    className="w-full pl-14 pr-6 py-5 bg-gray-100 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-3xl outline-none transition-all font-medium appearance-none"
                    required
                  >
                    <option value={0}>Choose where you live...</option>
                    {neighborhoods.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-brand-dark ml-2">
                  Bio / Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-5 bg-gray-100 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-3xl h-32 outline-none transition-all font-medium resize-none"
                  placeholder="Tell neighbors about your kids, hobbies..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl text-sm font-black text-center animate-bounce">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-dark text-white font-black py-6 rounded-3xl shadow-xl hover:bg-brand-orange transition-all transform hover:-translate-y-1 uppercase tracking-[0.2em] text-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Profile'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
