import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { familyApi, interestApi } from '../services/api'
import type { FamilyResponseDTO, InterestResponseDTO } from '../types'
import FamilyCard from '../components/FamilyCard'
import Navbar from '../components/layout/Navbar'
import bgImage from '../assets/littleneighbor_playing.png'
import {
  MapPin,
  Heart,
  Sparkles,
  FilterX,
  User,
  ArrowRight,
} from 'lucide-react'

export default function ExplorePage() {
  const navigate = useNavigate()
  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // FILTROS: Ahora selectedInterestIds es un ARRAY para selección múltiple
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([])
  const [ageRange, setAgeRange] = useState<{ min: number; max: number } | null>(
    null,
  )

  useEffect(() => {
    interestApi
      .getAll()
      .then(setAvailableInterests)
      .catch(err => console.error('Error loading interests:', err))
  }, [])

  const loadFamilies = async () => {
    setLoading(true)
    setError('')
    try {
      const filters = {
        // Si hay varios intereses, los enviamos (dependiendo de cómo los acepte tu API)
        ...(selectedInterestIds.length > 0 && {
          interestIds: selectedInterestIds,
        }),
        ...(ageRange && { minAge: ageRange.min, maxAge: ageRange.max }),
      }
      const data = await familyApi.explore(filters)
      setFamilies(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not find families.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFamilies()
  }, [selectedInterestIds, ageRange])

  // Lógica para marcar/desmarcar múltiples intereses
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
      {/* ── IMAGEN DE FONDO (LittleNeighbors Style) ── */}
      // 2. En tu JSX, usa esa constante dentro del objeto style
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(1.3) blur(0px)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-stone-950/90 z-0" />
      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* HEADER CON BOTÓN A PERFIL */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-orange-400 w-8 h-8" />
                <h1 className="text-5xl font-black tracking-tighter">
                  Explore Neighbor{' '}
                  <span className="text-orange-400">Playmates</span>
                </h1>
              </div>
              <p className="text-xl text-orange/70 font-medium">
                Discover your community in the neighborhood.
              </p>
            </div>

{/*            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-3 bg-white/10 hover:bg-orange-500 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/20 transition-all font-bold"
            >
              <User className="w-5 h-5" />
              My Profile
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>*/}
          </div>

          {/* FILTROS DINÁMICOS */}
          <section className="mb-12 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Edad */}
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

              {/* Intereses Múltiples */}
              <div className="space-y-4">
                <label className="text-xs font-black text-orange-400 uppercase tracking-widest">
                  Shared Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${
                        selectedInterestIds.includes(interest.id)
                          ? 'bg-coral-500 border-coral-500 text-black shadow-lg shadow-orange-500/20'
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
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-10 w-10 border-t-2 border-orange-500 mx-auto rounded-full" />
            </div>
          ) : families.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-16 text-center border border-white/10">
              <h2 className="text-3xl font-black mb-4">
                No playmates found yet!
              </h2>
              <p className="text-white/50 mb-8">
                Try adjusting your filters to find more neighbors.
              </p>
              <img
                src="/assets/littleneighbor_playing.png"
                className="w-48 h-48 mx-auto rounded-full object-cover border-4 border-orange-500"
                alt="No results"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {families.map(f => (
                <FamilyCard key={f.id} family={f} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
