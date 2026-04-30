import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { familyApi, interestApi } from '../services/api'
import type {
  FamilyResponseDTO,
  InterestResponseDTO,
  ChildSummaryDTO,
} from '../types'
import FamilyCard from '../components/FamilyCard'
import MainLayout from '../components/layout/MainLayout'
import bgImage from '../assets/littleneighbor_playing.png'
import {
  Heart,
  FilterX,
  ChevronDown,
  ArrowLeft,
  LayoutDashboard,
  User,
  Sparkles,
} from 'lucide-react'

export default function ExplorePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()


  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [myChildren, setMyChildren] = useState<ChildSummaryDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [, setError] = useState('')

  const [myChildId, setMyChildId] = useState<number | undefined>(
    searchParams.get('childId')
      ? Number(searchParams.get('childId'))
      : undefined,
  )
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

        if (myProfile?.children?.length > 0) {
          setMyChildren(myProfile.children)


          const defaultChild = searchParams.get('childId')
            ? myProfile.children.find(
                (c: any) => c.id === Number(searchParams.get('childId')),
              ) || myProfile.children[0]
            : myProfile.children[0]

          setMyChildId(defaultChild.id)
          setMyChildInterests(
            defaultChild.interests?.map((i: any) => i.id) || [],
          )
        }
      } catch (err) {
        console.error('Error initialization data:', err)
        setError(t('explore.errorProfile'))
      }
    }
    initData()
  }, [t, searchParams])


  const loadFamilies = useCallback(async () => {
    if (!myChildId) return
    setLoading(true)
    try {
      const filters = {
        currentChildId: myChildId,
        minAge: ageRange ? ageRange.min : 0,
        maxAge: ageRange ? ageRange.max : 12,
        interestIds:
          selectedInterestIds.length > 0 ? selectedInterestIds : undefined,
      }
      const data = await familyApi.explore(filters)


      const uniqueFamilies = Array.isArray(data)
        ? Array.from(new Map(data.map(f => [f.id, f])).values())
        : []

      setFamilies(uniqueFamilies)
    } catch (err: any) {
      console.error('Error loading families:', err)
      setError(t('explore.errorFamilies'))
    } finally {
      setLoading(false)
    }
  }, [myChildId, ageRange, selectedInterestIds, t])

  useEffect(() => {
    loadFamilies()
  }, [loadFamilies])

  const toggleInterest = (id: number) => {
    setSelectedInterestIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    )
  }

  const activeChild = useMemo(
    () => myChildren.find(c => c.id === myChildId),
    [myChildren, myChildId],
  )

  return (
    <MainLayout
      backgroundImage={bgImage}
      title={t('explore.title')}
      subtitle={t('explore.subtitle')}
      showGlassCard={false}
    >
      <div className="flex flex-col gap-8">
        {/* NAVEGACIÓN SUPERIOR */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all group shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t('common.back')}
            </span>
          </button>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-lg">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 hover:bg-[#F28749] rounded-full text-white transition-all hover:scale-110"
              title={t('navigation.dashboard')}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/20" />
            <button
              onClick={() => navigate('/add-child')}
              className="p-2.5 hover:bg-[#F28749] rounded-full text-white transition-all hover:scale-110"
              title={t('navigation.profile')}
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. SELECTOR DE HIJOS (Estilo mejorado) */}
        <div className="flex flex-wrap gap-3 items-center bg-white/10 backdrop-blur-md p-3 rounded-[2rem] border border-white/20 w-fit shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F28749]/20 rounded-full border border-[#F28749]/30">
            <Sparkles className="w-3 h-3 text-[#F28749]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">
              {t('explore.activeProfile')}
            </span>
          </div>

          {myChildren.map(child => (
            <button
              key={child.id}
              onClick={() => {
                setMyChildId(child.id)
                setMyChildInterests(child.interests?.map(i => i.id) || [])
              }}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                myChildId === child.id
                  ? 'bg-[#F28749] text-white shadow-[0_0_15px_rgba(242,135,73,0.4)] scale-105'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {child.gender === 'BOY' ? '👦' : '👧'} {child.age}{' '}
              {t('family.card.yearsOldSuffix')}
            </button>
          ))}
        </div>

        {/* 2. PANEL DE FILTROS */}
        <section className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Edad */}
          <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-xl flex flex-col justify-between transition-all hover:border-white/30">
            <div>
              <label className="text-[10px] font-black text-[#F28749] uppercase tracking-[0.2em] mb-4 block">
                {t('explore.filters.ageRangeLabel')}
              </label>
              <div className="relative">
                <select
                  value={ageRange ? `${ageRange.min}-${ageRange.max}` : ''}
                  onChange={e => {
                    if (!e.target.value) setAgeRange(null)
                    else {
                      const [min, max] = e.target.value.split('-').map(Number)
                      setAgeRange({ min, max })
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white appearance-none cursor-pointer focus:bg-white/20 outline-none transition-all"
                >
                  <option value="" className="text-gray-900">
                    {t('explore.filters.ageRangeAll')}
                  </option>
                  <option value="0-2" className="text-gray-900">
                    {t('explore.filters.ageRangeToddlers')}
                  </option>
                  <option value="3-5" className="text-gray-900">
                    {t('explore.filters.ageRangePreschoolers')}
                  </option>
                  <option value="6-12" className="text-gray-900">
                    {t('explore.filters.ageRangeSchool')}
                  </option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F28749] pointer-events-none" />
              </div>
            </div>

            {(ageRange || selectedInterestIds.length > 0) && (
              <button
                onClick={() => {
                  setAgeRange(null)
                  setSelectedInterestIds([])
                }}
                className="mt-8 flex items-center gap-2 text-[9px] font-black uppercase text-[#F28749] hover:text-white transition-colors"
              >
                <FilterX className="w-4 h-4" />
                {t('explore.filters.clearAll')}
              </button>
            )}
          </div>

          {/* Intereses */}
          <div className="w-full md:w-2/3 bg-white/10 backdrop-blur-xl rounded-[3rem] p-8 border border-white/20 shadow-xl text-white transition-all hover:border-white/30">
            <label className="text-[10px] font-black text-[#F28749] uppercase tracking-[0.2em] mb-5 block">
              {t('explore.filters.interestsLabel')}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map(interest => {
                const isSelected = selectedInterestIds.includes(interest.id)
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-white text-gray-900 border-white shadow-xl scale-105'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isSelected
                          ? 'fill-red-500 text-red-500'
                          : 'text-white/20'
                      }`}
                    />
                    {interest.name}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* 3. RESULTADOS */}
        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/5 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-white/10">
              <div className="animate-spin h-14 w-14 border-4 border-[#F28749] border-t-transparent rounded-full mb-6" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                {t('explore.loading', 'Buscando vecinos...')}
              </span>
            </div>
          ) : (
            <>
              {families.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                  {families.map(f => (
                    <div
                      key={f.id}
                      className="transform hover:-translate-y-3 transition-all duration-500"
                    >
                      <FamilyCard
                        family={f}
                        myChildId={myChildId}
                        myInterestIds={myChildInterests}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white/5 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-white/10">
                  <p className="text-white/40 font-black uppercase tracking-widest text-sm">
                    {t(
                      'explore.noNeighbors',
                      'No hay familias que coincidan con estos filtros',
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
