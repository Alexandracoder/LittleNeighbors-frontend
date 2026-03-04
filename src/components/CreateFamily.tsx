import familyBg from '../assets/create-family.png'
import React, { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { familyApi, neighborhoodApi } from '../services/api'
import type { NeighborhoodResponseDTO } from '../types'
import { Users, Info, MapPin, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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

  // 1. Cargar barrios al montar el componente
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

  // 2. Manejador del formulario
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (neighborhoodId === 0) {
      setError('Please select a neighborhood before continuing.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      setLoading(true);
      
      // 1. Llamada al API (ahora devuelve directamente el DTO, no el objeto Axios)
      const data = await familyApi.create({
        familyName,
        description,
        neighborhoodId,
        representativeName: '',
        profilePictureUrl: '',
      });

      // 2. Extraemos tokens directamente de 'data'
      const { accessToken, refreshToken } = data;

      if (accessToken && refreshToken) {
        // 3. Guardamos sesión y navegamos
        updateSession(accessToken, refreshToken);
        navigate('/add-child', { replace: true });
      } else {
        throw new Error('Tokens not found in server response');
      }
    } catch (err: any) {
      console.error('Error creating family:', err);
      // Ajuste para capturar el mensaje de error correctamente
      const errorMessage = err.response?.data?.message || err.message || 'Error creating family profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${familyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="relative z-20 w-full max-w-xl px-6">
        {!showForm ? (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Welcome, Neighbor!
            </h1>
            <p className="text-xl text-white/90 mb-10 drop-shadow-md">
              Your community is waiting for you.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full text-xl shadow-2xl transition-all transform hover:scale-105"
            >
              Start Our Story
            </button>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={28} />
            </button>

            <header className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800">
                Our Family Profile
              </h2>
              <p className="text-gray-500 mt-2">
                Introduce your family to the neighborhood
              </p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-bold text-gray-700 mb-2 ml-1">
                  <Users size={16} className="mr-2 text-orange-500" /> Family
                  Name
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-orange-400 outline-none transition-all bg-gray-50/50"
                  placeholder="e.g. The Millers"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-bold text-gray-700 mb-2 ml-1">
                  <MapPin size={16} className="mr-2 text-orange-500" />{' '}
                  Neighborhood
                </label>
                <select
                  value={neighborhoodId}
                  onChange={e => setNeighborhoodId(Number(e.target.value))}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-orange-400 outline-none transition-all bg-gray-50/50 appearance-none"
                  required
                >
                  <option value={0} disabled>
                    Select your area...
                  </option>
                  {neighborhoods.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-bold text-gray-700 mb-2 ml-1">
                  <Info size={16} className="mr-2 text-orange-500" /> About Us
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-orange-400 outline-none transition-all bg-gray-50/50 h-32 resize-none"
                  placeholder="Tell your neighbors about your family..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-orange-200 hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Family...' : 'Save and Continue'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
