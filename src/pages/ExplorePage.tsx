import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'

export default function ExplorePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [myChildren, setMyChildren] = useState<ChildSummaryDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [, setError] = useState('')

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

        if (myProfile?.children?.length > 0) {
          setMyChildren(myProfile.children)
          setMyChildId(myProfile.children[0].id)
          setMyChildInterests(
            myProfile.children[0].interests?.map((i: any) => i.id) || [],
          )
        }
      } catch (err) {
        console.error('Error initialization data:', err)
        setError(t('explore.errorProfile'))
      }
    }
    initData()
  }, [t])

 
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
      setFamilies(data)
    } catch (err: any) {
      setError(t('explore.errorFamilies')) // Clave del JSON
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

  return (
    <MainLayout
      backgroundImage={bgImage}
      title={t('explore.title')}
      subtitle={t('explore.subtitle')}
      showGlassCard={false}
    >
      <div className="flex flex-col gap-8">
        {/* --- NAVEGACIÓN SUPERIOR --- */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t('common.back')}
            </span>
          </button>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20">
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

        {/* 1. SELECTOR DE HIJOS */}
        <div className="flex flex-wrap gap-3 items-center bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 w-fit shadow-xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-4 mr-2">
            {t('explore.activeProfile')}
          </span>
          {myChildren.map(child => (
            <button
              key={child.id}
              onClick={() => {
                setMyChildId(child.id)
                setMyChildInterests(child.interests?.map(i => i.id) || [])
              }}
              className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
                myChildId === child.id
                  ? 'bg-[#F28749] text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              {child.gender === 'BOY' ? '👦' : '👧'} {child.age}{' '}
              {t('family.card.yearsOldSuffix').toLowerCase()}
            </button>
          ))}
        </div>

        {/* 2. PANEL DE FILTROS */}
        <section className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* IZQUIERDA: Edad */}
          <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-7 border border-white/20 shadow-xl flex flex-col justify-between">
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
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm font-bold text-white appearance-none cursor-pointer focus:bg-white/20 outline-none transition-all"
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
                className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase text-[#F28749] hover:text-white transition-colors"
              >
                <FilterX className="w-4 h-4" />
                {t('explore.filters.clearAll')}
              </button>
            )}
          </div>

          {/* DERECHA: Intereses */}
          <div className="w-full md:w-2/3 bg-white/10 backdrop-blur-xl rounded-[3rem] p-7 border border-white/20 shadow-xl text-white">
            <label className="text-[10px] font-black text-[#F28749] uppercase tracking-[0.2em] mb-4 block">
              {t('explore.filters.interestsLabel')}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map(interest => {
                const isSelected = selectedInterestIds.includes(interest.id)
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-white text-[#333D47] border-white shadow-lg scale-105'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
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
            <div className="text-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-[#F28749] border-t-transparent rounded-full mx-auto mb-4" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
              {families.map(f => (
                <div
                  key={f.id}
                  className="transform hover:-translate-y-2 transition-transform duration-300"
                >
                  <FamilyCard
                    family={f}
                    myChildId={myChildId}
                    myInterestIds={myChildInterests}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
