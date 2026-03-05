import { useState, useEffect } from 'react'
import { familyApi, interestApi } from '../services/api'
import type { FamilyResponseDTO, InterestResponseDTO } from '../types'
import FamilyCard from '../components/FamilyCard' // Necesitarás crear este componente
import { MapPin, Search, Heart, Sparkles, FilterX } from 'lucide-react'

// URLs de tus imágenes generadas (reemplaza con las rutas reales de tu proyecto)
const FAMILY_HOME_IMG = '/assets/new-at-neighborhood.png' // image_0.png
const KID_PLAYING_IMG = '/assets/littleneighbor_playing.png' // image_1.png

export default function ExplorePage() {
  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estados para los filtros dinámicos
  const [selectedInterestId, setSelectedInterestId] = useState<number | null>(
    null,
  )
  const [ageRange, setAgeRange] = useState<{ min: number; max: number } | null>(
    null,
  )

  // 1. Cargar intereses al inicio
  useEffect(() => {
    interestApi
      .getAll()
      .then(setAvailableInterests)
      .catch(err => console.error('Error loading interests:', err))
  }, [])

  // 2. Cargar familias (con filtros si los hay)
  const loadFamilies = async () => {
    setLoading(true)
    setError('')
    try {
      const filters = {
        ...(selectedInterestId && { interestId: selectedInterestId }),
        ...(ageRange && { minAge: ageRange.min, maxAge: ageRange.max }),
      }
      const data = await familyApi.explore(filters)
      setFamilies(data)
    } catch (err: any) {
      console.error('Error exploring families:', err)
      setError(
        err.response?.data?.message ||
          'Could not find families. Check your connection.',
      )
    } finally {
      setLoading(false)
    }
  }

  // 3. Ejecutar búsqueda cada vez que un filtro cambia
  useEffect(() => {
    loadFamilies()
  }, [selectedInterestId, ageRange])

  // Rangos de edad predefinidos para los botones rápidos
  const ageFilters = [
    { label: 'Toddlers (0-2)', min: 0, max: 2 },
    { label: 'Preschoolers (3-5)', min: 3, max: 5 },
    { label: 'School Age (6+)', min: 6, max: 12 },
  ]

  return (
    <div className="min-h-screen bg-brand-cream/30 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* HEADER & BANNER (Usando image_0.png) */}
        <header className="mb-12 rounded-[3rem] bg-white shadow-xl overflow-hidden border-t-8 border-brand-orange">
          <div className="flex flex-col md:flex-row items-center">
            {/* Texto del Header */}
            <div className="p-12 md:flex-1">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-brand-coral w-10 h-10" />
                <h1 className="text-5xl font-black text-brand-dark tracking-tighter">
                  Explore Neighbor{' '}
                  <span className="text-brand-orange">Playmates</span>
                </h1>
              </div>
              <p className="text-lg text-gray-600 font-bold max-w-xl">
                Discover families in your neighborhood with children of similar
                ages and shared interests.
              </p>
            </div>

            {/* Imagen 0: Familia acogedora */}
            <div className="md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden">
              <img
                src={'assets/making-friends.png'}
                alt="Happy family at home"
                className="w-full h-full object-cover scale-105"
              />
            </div>
          </div>
        </header>

        {/* SECTION: FILTROS DE BÚSQUEDA */}
        <section className="mb-12 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-inner border-2 border-brand-orange/10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Filtros de Edad */}
            <div className="flex-1 space-y-4">
              <label className="block text-xs font-black text-brand-orange uppercase tracking-[0.2em] ml-2">
                Filter by Age
              </label>
              <div className="flex flex-wrap gap-3">
                {ageFilters.map(filter => (
                  <button
                    key={filter.label}
                    onClick={() =>
                      setAgeRange({ min: filter.min, max: filter.max })
                    }
                    className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      ageRange?.min === filter.min &&
                      ageRange?.max === filter.max
                        ? 'bg-brand-orange text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:border-brand-orange/40 hover:bg-orange-50/50 border-2 border-gray-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros de Intereses */}
            <div className="flex-1 space-y-4">
              <label className="block text-xs font-black text-brand-orange uppercase tracking-[0.2em] ml-2">
                Shared Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {availableInterests.slice(0, 10).map(interest => (
                  <button
                    key={interest.id}
                    onClick={() =>
                      setSelectedInterestId(prev =>
                        prev === interest.id ? null : interest.id,
                      )
                    }
                    className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                      selectedInterestId === interest.id
                        ? 'bg-brand-coral border-brand-coral text-white shadow-md'
                        : 'border-brand-orange/10 bg-white text-gray-400 hover:border-brand-orange'
                    }`}
                  >
                    <Heart
                      className={`w-3 h-3 ${
                        selectedInterestId === interest.id ? 'fill-current' : ''
                      }`}
                    />
                    {interest.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Limpiar Filtros */}
            {(ageRange || selectedInterestId) && (
              <button
                onClick={() => {
                  setAgeRange(null)
                  setSelectedInterestId(null)
                }}
                className="p-4 bg-gray-100 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-2"
              >
                <FilterX className="w-5 h-5" />
              </button>
            )}
          </div>
        </section>

        {/* SECTION: RESULTADOS */}
        {loading && (
          <div className="text-center py-24 bg-white/40 backdrop-blur-md rounded-[3rem]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-orange mx-auto"></div>
            <p className="mt-6 font-black text-brand-orange animate-pulse uppercase tracking-widest">
              Searching the neighborhood...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-red-50 text-red-500 rounded-[3rem] border-2 border-red-100">
            <h2 className="text-3xl font-black mb-2">Oops!</h2>
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* ESTADO VACÍO (Usando image_1.png) */}
        {!loading && !error && families.length === 0 && (
          <div className="bg-white rounded-[3rem] shadow-xl p-16 flex flex-col md:flex-row items-center gap-12 text-center md:text-left overflow-hidden relative">
            {/* Elemento decorativo sutil */}
            <div className="absolute top-0 left-0 opacity-10">
              <Sparkles className="w-96 h-96 text-brand-orange" />
            </div>

            {/* Imagen 1: Niño jugando */}
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-8 border-white shrink-0 relative z-10">
              <img
                src={KID_PLAYING_IMG}
                alt="Kid playing fun"
                className="w-full h-full object-cover scale-110"
              />
            </div>

            <div className="relative z-10 flex-1">
              <h2 className="text-4xl font-black text-brand-dark tracking-tight mb-4">
                Someone is looking for a{' '}
                <span className="text-brand-orange">Playmate!</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium max-w-lg mb-8">
                Currently, there are no matches for your specific filters. Try
                adjusting your search to discover more Little Neighbors!
              </p>
              <button
                onClick={() => {
                  setAgeRange(null)
                  setSelectedInterestId(null)
                }}
                className="px-8 py-4 bg-brand-orange text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}

        {/* GRID DE RESULTADOS (Si hay familias) */}
        {!loading && !error && families.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {families.map(family => (
              <div
                key={family.id}
                className="hover:scale-[1.02] transition-transform"
              >
                <FamilyCard family={family} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
