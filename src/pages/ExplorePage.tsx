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
  Users,
  Share2,
} from 'lucide-react'

export default function ExplorePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  // Estados de datos
  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [myChildren, setMyChildren] = useState<ChildSummaryDTO[]>([])
  const [loading, setLoading] = useState(false)

  // Modos de búsqueda: neighborhood (barrio) o city (ciudad)
  const [searchMode, setSearchMode] = useState<'neighborhood' | 'city'>(
    'neighborhood',
  )

  // Filtros
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

  // Inicialización de datos (Intereses y Perfil propio)
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
      }
    }
    initData()
  }, [searchParams])

  // Carga de familias con lógica de "Scope" (Barrio o Ciudad)
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
        scope: searchMode, // Enviamos el modo al backend
      }

      const data = await familyApi.explore(filters)
      const uniqueFamilies = Array.isArray(data)
        ? Array.from(new Map(data.map(f => [f.id, f])).values())
        : []

      setFamilies(uniqueFamilies)
    } catch (err: any) {
      console.error('Error loading families:', err)
    } finally {
      setLoading(false)
    }
  }, [myChildId, ageRange, selectedInterestIds, searchMode])

  useEffect(() => {
    loadFamilies()
  }, [loadFamilies])

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'LittleNeighbors',
          text: t(
            'explore.shareText',
            '¡Únete a mi barrio en LittleNeighbors para que nuestros hijos jueguen juntos!',
          ),
          url: window.location.origin,
        })
        .catch(console.error)
    }
  }

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
        {/* NAVEGACIÓN Y SELECTOR DE MODO */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all group shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t('common.back')}
            </span>
          </button>

          {/* Toggle de Barrio / Ciudad */}
          <div className="flex bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setSearchMode('neighborhood')}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                searchMode === 'neighborhood'
                  ? 'bg-[#F28749] text-white shadow-lg'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {t('explore.mode.neighborhood', 'Mi Barrio')}
            </button>
            <button
              onClick={() => setSearchMode('city')}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                searchMode === 'city'
                  ? 'bg-[#F28749] text-white shadow-lg'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {t('explore.mode.city', 'Toda la Ciudad')}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-lg">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 hover:bg-[#F28749] rounded-full text-white transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/20" />
            <button
              onClick={() => navigate('/add-child')}
              className="p-2.5 hover:bg-[#F28749] rounded-full text-white transition-all"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SELECTOR DE HIJOS */}
        <div className="flex flex-wrap gap-3 items-center bg-white/10 backdrop-blur-md p-3 rounded-[2rem] border border-white/20 w-fit shadow-2xl">
          {myChildren.map(child => (
            <button
              key={child.id}
              onClick={() => {
                setMyChildId(child.id)
                setMyChildInterests(child.interests?.map(i => i.id) || [])
              }}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                myChildId === child.id
                  ? 'bg-[#F28749] text-white scale-105'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              <span className="mr-2">
                {child.gender === 'BOY' ? '👦' : '👧'}
              </span>
              {child.nickname ||
                `${child.age} ${t('family.card.yearsOldSuffix')}`}
            </button>
          ))}
        </div>

        {/* FILTROS */}
        <section className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-xl">
            <label className="text-[10px] font-black text-[#F28749] uppercase tracking-[0.2em] mb-4 block">
              {t('explore.filters.ageRangeLabel')}
            </label>
            <select
              value={ageRange ? `${ageRange.min}-${ageRange.max}` : ''}
              onChange={e => {
                if (!e.target.value) setAgeRange(null)
                else {
                  const [min, max] = e.target.value.split('-').map(Number)
                  setAgeRange({ min, max })
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white appearance-none outline-none"
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
          </div>

          <div className="w-full md:w-2/3 bg-white/10 backdrop-blur-xl rounded-[3rem] p-8 border border-white/20 shadow-xl">
            <div className="flex flex-wrap gap-2">
              {availableInterests.map(interest => {
                const isSelected = selectedInterestIds.includes(interest.id)
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-white text-gray-900 border-white'
                        : 'border-white/10 bg-white/5 text-white/60'
                    }`}
                  >
                    <Heart
                      className={`w-3 h-3 ${
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

        {/* RESULTADOS */}
        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/5 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-white/10">
              <div className="animate-spin h-14 w-14 border-4 border-[#F28749] border-t-transparent rounded-full mb-6" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                {t('explore.loading')}
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
                /* EMPTY STATE PROACTIVO */
                <div className="text-center py-20 px-6 bg-white/5 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-white/20 animate-in fade-in zoom-in duration-500">
                  <div className="bg-[#F28749]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-[#F28749] w-10 h-10" />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">
                    {searchMode === 'neighborhood'
                      ? t(
                          'explore.empty.neighborhoodTitle',
                          '¡Sé el pionero de tu barrio!',
                        )
                      : t(
                          'explore.empty.generalTitle',
                          'Aún no hay compañeros cerca',
                        )}
                  </h3>

                  <p className="text-white/60 max-w-sm mx-auto mb-10 font-medium">
                    {t(
                      'explore.empty.description',
                      'LittleNeighbors crece con familias como la tuya. ¡Ayúdanos a llenar tu barrio de diversión!',
                    )}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {searchMode === 'neighborhood' && (
                      <button
                        onClick={() => setSearchMode('city')}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/20"
                      >
                        {t('explore.empty.expandSearch', 'Ver toda la ciudad')}
                      </button>
                    )}

                    <button
                      onClick={handleShare}
                      className="px-8 py-4 bg-[#F28749] hover:bg-[#e0763d] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-3"
                    >
                      <Share2 className="w-4 h-4" />
                      {t('explore.empty.inviteNeighbors', 'Invitar vecinos')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
