import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { familyApi, interestApi } from '../services/api'
import type { FamilyResponseDTO, InterestResponseDTO } from '../types'
import FamilyCard from '../components/FamilyCard'
import Navbar from '../components/layout/Navbar'
import bgImage from '../assets/littleneighbor_playing.png'
import { MapPin, Heart, FilterX } from 'lucide-react'

export default function ExplorePage() {
  const navigate = useNavigate()
  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Necesitamos tanto el ID del niño como el del barrio para el Backend
  const [myChildId, setMyChildId] = useState<number | undefined>(undefined)
  const [myNeighborhoodId, setMyNeighborhoodId] = useState<number | undefined>(
    undefined,
  )

  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([])
  const [ageRange, setAgeRange] = useState<{ min: number; max: number } | null>(
    null,
  )

  // 1. Carga inicial: Datos del usuario y catálogo de intereses
  useEffect(() => {
    const initData = async () => {
      try {
        const [interests, myProfile] = await Promise.all([
          interestApi.getAll(),
          familyApi.getMyFamily(),
        ])
        setAvailableInterests(interests)

        if (myProfile?.neighborhoodId) {
          setMyNeighborhoodId(myProfile.neighborhoodId.id)
        }

        if (myProfile?.children && myProfile.children.length > 0) {
          // Tomamos el primer hijo como referencia para la búsqueda
          setMyChildId(myProfile.children[0].id)
        }
      } catch (err) {
        console.error('Error initialization data:', err)
      }
    }
    initData()
  }, [])

  // 2. Función de carga de familias con los parámetros requeridos por el Controller
  const loadFamilies = useCallback(async () => {
    // Si no tenemos los IDs obligatorios, abortamos para evitar el Error 500
    if (myNeighborhoodId === undefined || myChildId === undefined) return

    setLoading(true)
    setError('')
    try {
      const filters = {
        neighborhoodId: myNeighborhoodId,
        currentChildId: myChildId,
        minAge: ageRange ? ageRange.min : 0,
        maxAge: ageRange ? ageRange.max : 18,
        ...(selectedInterestIds.length > 0 && {
          interestIds: selectedInterestIds,
        }),
      }

      const data = await familyApi.explore(filters)
      setFamilies(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not find families.')
    } finally {
      setLoading(false)
    }
  }, [myNeighborhoodId, myChildId, ageRange, selectedInterestIds])

  // 3. Efecto para recargar cuando cambien filtros o datos de sesión
  useEffect(() => {
    loadFamilies()
  }, [loadFamilies])

  const toggleInterest = (id: number) => {
    setSelectedInterestIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    )
  }

  const ageFilters = [
    { label: 'Toddlers (0-2)', min: 0, max: 2 },
    { label: 'Preschoolers (3-5)', min: 3, max: 5 },
    { label: 'School Age (6+)', min: 6, max: 12 },
  ]

  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden text-white">
      {/* BACKGROUND & OVERLAYS */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(0.7)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-stone-950/90 z-0" />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* HEADER */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="text-orange-400 w-8 h-8" />
              <h1 className="text-5xl font-black tracking-tighter">
                Explore Neighbor{' '}
                <span className="text-orange-400">Playmates</span>
              </h1>
            </div>
            <p className="text-xl text-white/70 font-medium">
              Discover your community in the neighborhood.
            </p>
          </div>

          {/* FILTROS */}
          <section className="mb-12 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-orange-400 uppercase tracking-widest">
                  Age Groups
                </label>
                <div className="flex flex-wrap gap-3">
                  {ageFilters.map(f => (
                    <button
                      key={f.label}
                      onClick={() =>
                        setAgeRange(
                          ageRange?.min === f.min
                            ? null
                            : { min: f.min, max: f.max },
                        )
                      }
                      className={`px-5 py-3 rounded-full text-xs font-bold transition-all border-2 ${
                        ageRange?.min === f.min
                          ? 'bg-orange-500 border-orange-500'
                          : 'bg-transparent border-white/10 hover:border-orange-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-orange-400 uppercase tracking-widest">
                  Shared Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button
                      key={interest.id} // Aquí interest es el objeto, interest.id es correcto
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${
                        selectedInterestIds.includes(interest.id)
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-white/10 bg-white/5 text-white/50 hover:border-orange-500'
                      }`}
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          selectedInterestIds.includes(interest.id)
                            ? 'fill-current'
                            : ''
                        }`}
                      />
                      {interest.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(ageRange || selectedInterestIds.length > 0) && (
              <button
                onClick={() => {
                  setAgeRange(null)
                  setSelectedInterestIds([])
                }}
                className="mt-6 flex items-center gap-2 text-xs text-orange-400 hover:text-white transition-colors"
              >
                <FilterX className="w-4 h-4" /> Reset Filters
              </button>
            )}
          </section>

          {/* RESULTADOS */}
          {error && (
            <div className="text-red-400 mb-6 text-center">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-10 w-10 border-t-2 border-orange-500 mx-auto rounded-full" />
            </div>
          ) : families.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-16 text-center border border-white/10">
              <h2 className="text-3xl font-black mb-4">No playmates found!</h2>
              <p className="text-white/50">
                Try adjusting your filters or neighborhood.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {families.map(f => (
                <FamilyCard
                  key={f.id}
                  family={f}
                  myChildId={myChildId} // Aquí myChildId es un number, pásalo tal cual
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
