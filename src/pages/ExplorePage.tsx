import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { familyApi, interestApi } from '../services/api'
import type { FamilyResponseDTO, InterestResponseDTO } from '../types'
import FamilyCard from '../components/FamilyCard'
import Navbar from '../components/layout/Navbar'
import bgImage from '../assets/littleneighbor_playing.png'
import { MapPin, Heart, FilterX, Sparkles, Loader2, Save } from 'lucide-react'

export default function ExplorePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [myChildId, setMyChildId] = useState<number | undefined>(undefined)
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
        if (myProfile?.children && myProfile.children.length > 0) {
          setMyChildId(myProfile.children[0].id)
        }
      } catch (err) {
        console.error('Error initializing explore data:', err)
      }
    }
    initData()
  }, [])

  const loadFamilies = async () => {
    setLoading(true)
    setError('')
    try {
      const filters = {
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

  const toggleInterest = (id: number) => {
    setSelectedInterestIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    )
  }

  const ageFilters = [
    { label: t('born'), min: 0, max: 2 },
    { label: 'Preschool (3-5)', min: 3, max: 5 },
    { label: 'School (6+)', min: 6, max: 12 },
  ]

  return (
    <div className="min-h-screen bg-brand-dark relative overflow-hidden text-white">
      {/* Background Layer */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0 scale-105"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(0.6) saturate(1.2)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-brand-dark/80 via-transparent to-brand-dark z-0" />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-16">
          {/* HEADER */}
          <div className="mb-12 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <div className="p-3 bg-brand-orange rounded-2xl shadow-lg shadow-brand-orange/20">
                <MapPin className="text-white w-8 h-8" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                {t('Explore')}{' '}
                <span className="text-brand-orange">
                  {t('Neighbor Playmates')}
                </span>
              </h1>
            </div>
            <p className="text-lg text-white/60 font-medium max-w-2xl mx-auto md:mx-0 leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* FILTERS PANEL - FLOTANTE, COMPACTA, MÁS ABAJO Y A LA DERECHA */}
          <div className="flex justify-center md:justify-end mb-24 pr-0 md:pr-10">
            <section className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] max-w-xl">
              <div className="space-y-8">
                {/* Age Filters Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-brand-orange" />
                    <label className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em]">
                      {t('AGE GROUPS')}
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
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
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          ageRange?.min === f.min
                            ? 'bg-brand-orange border-brand-orange text-white shadow-lg'
                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-3 h-3 text-white/40" />
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                      {t('intereses')}
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableInterests.map(interest => (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all flex items-center gap-2 border ${
                          selectedInterestIds.includes(interest.id)
                            ? 'bg-brand-dark/80 border-brand-orange text-brand-orange shadow-lg scale-105'
                            : 'bg-black/20 border-white/5 text-white/40 hover:border-white/20'
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

              {/* Clear Filters Button - Pequeño y discreto abajo */}
              {(ageRange || selectedInterestIds.length > 0) && (
                <button
                  onClick={() => {
                    setAgeRange(null)
                    setSelectedInterestIds([])
                  }}
                  className="mt-8 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-brand-orange transition-colors mx-auto"
                >
                  <FilterX className="w-3 h-3" /> {t('Reset Filters')}
                </button>
              )}
            </section>
          </div>

          {/* RESULTS GRID */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="animate-spin h-12 w-12 text-brand-orange" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                {t('loading')}
              </p>
            </div>
          ) : families.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-[4rem] p-24 text-center border border-white/10 max-w-4xl mx-auto">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                {t('Playmates not found')}
              </h2>
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
                {t('Try adjusting your filters or check back later.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {families.map(f => (
                <FamilyCard key={f.id} family={f} myChildId={myChildId} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
