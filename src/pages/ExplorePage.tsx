import { useState, useEffect, useCallback } from 'react'
import { familyApi, interestApi } from '../services/api'
import type {
  FamilyResponseDTO,
  InterestResponseDTO,
  ChildSummaryDTO,
} from '../types'
import FamilyCard from '../components/FamilyCard'
import Navbar from '../components/layout/Navbar'
import bgImage from '../assets/littleneighbor_playing.png'
import { MapPin, Heart, FilterX } from 'lucide-react'

export default function ExplorePage() {
  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [myChildren, setMyChildren] = useState<ChildSummaryDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [myChildId, setMyChildId] = useState<number | undefined>(undefined)
  const [myChildInterests, setMyChildInterests] = useState<number[]>([])
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([])
  const [ageRange, setAgeRange] = useState<{ min: number; max: number } | null>(
    null,
  )

  useEffect(() => {
    const initData = async () => {
      try {
        const [interests, myProfile] = await Promise.all([
          interestApi.getAll(),
          familyApi.getMyFamily(),
        ])
        setAvailableInterests(interests)

        if (myProfile && myProfile.children && myProfile.children.length > 0) {
          setMyChildren(myProfile.children)
          setMyChildId(myProfile.children[0].id)
        }
      } catch (err) {
        console.error('Error initialization data:', err)
        setError('Please complete your family profile first.')
      }
    }
    initData()
  }, [])

useEffect(() => {
  const activeChild = myChildren.find(c => c.id === myChildId)
  if (activeChild) {
    const ids =
      activeChild.interests?.map((i: InterestResponseDTO) => i.id) || []
    setMyChildInterests(ids)
  }
}, [myChildId, myChildren])


  const loadFamilies = useCallback(async () => {
    if (!myChildId) return

    setLoading(true)
    setError('')
    try {
      const filters = {
        currentChildId: myChildId,
        minAge: ageRange ? ageRange.min : 0,
        maxAge: ageRange ? ageRange.max : 12,
        interestIds:
          selectedInterestIds.length > 0 ? selectedInterestIds : undefined,
      }

      const data = await familyApi.explore(filters)
      setFamilies(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not find families.')
    } finally {
      setLoading(false)
    }
  }, [myChildId, ageRange, selectedInterestIds])

  useEffect(() => {
    loadFamilies()
  }, [loadFamilies])

  const toggleInterest = (id: number) => {
    setSelectedInterestIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden text-white font-sans">
      {/* Background Layer */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(0.4)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-stone-950/80 via-transparent to-stone-950/90 z-0" />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Header & Profile Selector */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-orange-400 w-8 h-8" />
                <h1 className="text-5xl font-black tracking-tighter uppercase italic">
                  Explore <span className="text-orange-400">Playmates</span>
                </h1>
              </div>
              <p className="text-xl text-white/70 font-medium">
                Find families with similar interests.
              </p>
            </div>

            {myChildren.length > 0 && (
              <div className="bg-white/10 p-2 rounded-[2rem] border border-white/20 flex gap-2">
                {myChildren.map(child => (
                  <button
                    key={`child-${child.id}`}
                    onClick={() => setMyChildId(child.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-[1.5rem] transition-all ${
                      myChildId === child.id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'hover:bg-white/5 text-white/60'
                    }`}
                  >
                    <span className="text-xl">
                      {child.gender === 'BOY' ? '👦' : '👧'}
                    </span>
                    <div className="text-left">
                      <div className="text-[10px] font-black uppercase leading-none">
                        Active Profile
                      </div>
                      <div className="text-xs font-bold italic">
                        {child.age} yrs
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters Section */}
          <section className="mb-12 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                  Age Groups
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Toddlers (0-2)', min: 0, max: 2 },
                    { label: 'Preschoolers (3-5)', min: 3, max: 5 },
                    { label: 'School Age (6+)', min: 6, max: 12 },
                  ].map(f => (
                    <button
                      key={f.label}
                      onClick={() =>
                        setAgeRange(
                          ageRange?.min === f.min
                            ? null
                            : { min: f.min, max: f.max },
                        )
                      }
                      className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all border-2 ${
                        ageRange?.min === f.min
                          ? 'bg-orange-500 border-orange-500'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button
                      key={`interest-${interest.id}`}
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border-2 ${
                        selectedInterestIds.includes(interest.id)
                          ? 'bg-white text-stone-950 border-white'
                          : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          selectedInterestIds.includes(interest.id)
                            ? 'fill-orange-500 text-orange-500'
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
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-center md:justify-start">
                <button
                  onClick={() => {
                    setAgeRange(null)
                    setSelectedInterestIds([])
                  }}
                  className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 hover:text-white transition-all duration-300"
                >
                  <FilterX className="w-4 h-4" />
                  <span>Clear all filters</span>
                </button>
              </div>
            )}
          </section>

          {/* Families Grid */}
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full" />
              <span className="text-orange-400 font-black uppercase text-xs">
                Finding neighbors...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-500/10 rounded-[3rem] border border-red-500/20">
              <p className="text-red-400 font-bold uppercase tracking-widest text-sm">
                {error}
              </p>
            </div>
          ) : families.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-20 text-center border border-white/10">
              <h2 className="text-4xl font-black mb-4 uppercase italic">
                Lonely neighborhood?
              </h2>
              <p className="text-white/40 max-w-md mx-auto">
                No families match your current filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {families.map(f => (
                <FamilyCard
                  key={f.id}
                  family={f}
                  myChildId={myChildId}
                  myInterestIds={myChildInterests}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
