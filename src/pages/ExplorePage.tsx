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
import { translateNicknameOrDefault } from '../utils/nicknames'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'


import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

import {
  Heart,
  ArrowLeft,
  LayoutDashboard,
  User,
  Users,
  Share2,
  SlidersHorizontal,
  X,
  Map,
  Grid,
  ShieldCheck,
} from 'lucide-react'


const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})
L.Marker.prototype.options.icon = DefaultIcon

export default function ExplorePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { status } = useAuth()

  // Sin verificar: solo vemos el mapa anonimizado (mapPins), nunca perfiles
  // completos. El backend ya rechaza /explore para no verificados, pero
  // aquí evitamos directamente la llamada que fallaría, y mostramos en su
  // lugar el resumen (/explore/map-summary), que sí está siempre abierto.
  const isVerified = status?.verificationStatus === 'VERIFIED'
  const [mapPins, setMapPins] = useState<
    { latitude: number; longitude: number }[]
  >([])

  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [availableInterests, setAvailableInterests] = useState<
    InterestResponseDTO[]
  >([])
  const [myChildren, setMyChildren] = useState<ChildSummaryDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [searchMode, setSearchMode] = useState<'neighborhood' | 'city'>(
    'neighborhood',
  )


  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  useEffect(() => {
    if (!isVerified) setViewMode('map')
  }, [isVerified])


  const valenciaCenter: [number, number] = [39.4699, -0.3763]


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
  const [includePregnant, setIncludePregnant] = useState(false)

  const getTranslatedNickname = (nickname: string, gender: string) =>
    translateNicknameOrDefault(nickname, gender, t)

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

  const loadFamilies = useCallback(async () => {
    if (!isVerified) {
      // Sin verificar: solo el resumen anónimo del mapa, nada de perfiles.
      setLoading(true)
      try {
        const pins = await familyApi.exploreMapSummary(searchMode)
        setMapPins(Array.isArray(pins) ? pins : [])
        setFamilies([])
      } catch (err) {
        console.error('Error loading map summary:', err)
      } finally {
        setLoading(false)
      }
      return
    }

    if (!myChildId) return
    setLoading(true)
    try {
      const filters = {
        currentChildId: myChildId,
        minAge: ageRange ? ageRange.min : 0,
        maxAge: ageRange ? ageRange.max : 12,
        interestIds:
          selectedInterestIds.length > 0 ? selectedInterestIds : undefined,
        includePregnant,
        scope: searchMode,
      }

      const data = await familyApi.explore(filters)
const seenIds = new Set()
const uniqueFamilies = Array.isArray(data)
  ? data.filter(f => {
      if (seenIds.has(f.id)) return false
      seenIds.add(f.id)
      return true
    })
  : []

setFamilies(uniqueFamilies)
    } catch (err: any) {
      console.error('Error loading families:', err)
    } finally {
      setLoading(false)
    }
  }, [
    isVerified,
    myChildId,
    ageRange,
    selectedInterestIds,
    includePregnant,
    searchMode,
  ])

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

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (ageRange) count++
    if (selectedInterestIds.length > 0) count += selectedInterestIds.length
    if (includePregnant) count++
    return count
  }, [ageRange, selectedInterestIds, includePregnant])

  
  const familiesWithCoordinates = useMemo(() => {
    return families.filter(
      f =>
        f.latitude !== null &&
        f.longitude !== null &&
        f.latitude !== undefined &&
        f.longitude !== undefined &&
        !Number.isNaN(f.latitude) &&
        !Number.isNaN(f.longitude),
    )
  }, [families])

  return (
    <MainLayout
      backgroundImage={bgImage}
      title={t('explore.title')}
      subtitle={t('explore.subtitle')}
      showGlassCard={false}
    >
      <div className="flex flex-col gap-6 relative">
        {/* NAVEGACIÓN Y BARRA DE CONTROL SUPERIOR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t('common.back')}
            </span>
          </button>

          {/* Toggle Core: Barrio / Ciudad */}
          <div className="w-full sm:w-auto flex bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setSearchMode('neighborhood')}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all min-h-[44px] ${
                searchMode === 'neighborhood'
                  ? 'bg-[#F28749] text-white shadow-lg'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {t('explore.mode.neighborhood', 'Mi Barrio')}
            </button>
            <button
              onClick={() => setSearchMode('city')}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all min-h-[44px] ${
                searchMode === 'city'
                  ? 'bg-[#F28749] text-white shadow-lg'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {t('explore.mode.city', 'Toda la Ciudad')}
            </button>
          </div>

          {/* Botonera de Acceso Rápido */}
          <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-lg">
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

        {/* SELECTOR DE PERFIL DE HIJO ACTIVO, TOGGLE VISTA Y FILTROS */}
        <div className="flex items-center justify-between gap-4 w-full bg-white/10 backdrop-blur-md p-2 rounded-[2rem] border border-white/20 shadow-xl">
          <div className="flex flex-wrap gap-2 items-center">
            {myChildren.map(child => (
              <button
                key={child.id}
                onClick={() => {
                  setMyChildId(child.id)
                  setMyChildInterests(child.interests?.map(i => i.id) || [])
                }}
                className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all min-h-[40px] flex items-center ${
                  myChildId === child.id
                    ? 'bg-[#F28749] text-white scale-105 shadow-md'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <span className="mr-1.5">
                  {child.gender === 'BOY' ? '👦' : '👧'}
                </span>
                {getTranslatedNickname(child.nickname, child.gender)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* 🗺️ BOTÓN TOGGLE MAPA / GRID — oculto sin verificar: solo hay mapa */}
            {isVerified && (
            <button
              onClick={() =>
                setViewMode(prev => (prev === 'grid' ? 'map' : 'grid'))
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-wider transition-all min-h-[40px] hover:bg-white/10"
            >
              {viewMode === 'grid' ? (
                <>
                  <Map className="w-3.5 h-3.5 text-[#F28749]" />
                  <span className="hidden xs:inline">Ver Mapa</span>
                </>
              ) : (
                <>
                  <Grid className="w-3.5 h-3.5 text-[#F28749]" />
                  <span className="hidden xs:inline">Ver Lista</span>
                </>
              )}
            </button>
            )}

            {/* Botón Controlador de Filtros */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all min-h-[40px] ${
                activeFiltersCount > 0
                  ? 'bg-white text-gray-900 border-white shadow-lg'
                  : 'bg-white/5 text-white border-white/10'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">
                {t('explore.filters.title', 'Filtros')}
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#F28749] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- DRAWER DE FILTROS (Código original intacto) --- */}
        <div
          className={`fixed inset-0 z-50 transition-all duration-500 ${
            isFilterDrawerOpen
              ? 'visible pointer-events-auto'
              : 'invisible pointer-events-none'
          }`}
        >
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
              isFilterDrawerOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-[#2D2D2D] rounded-t-[2.5rem] p-8 border-t border-white/10 shadow-2xl transition-transform duration-500 md:left-auto md:right-0 md:top-0 md:bottom-0 md:w-[450px] md:max-h-screen md:rounded-t-none md:rounded-l-[3rem] md:border-l md:border-t-0 ${
              isFilterDrawerOpen
                ? 'translate-y-0 md:translate-x-0'
                : 'translate-y-full md:translate-x-full'
            }`}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#F28749]" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                  {t('explore.filters.title', 'Filtros Avanzados')}
                </h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-[9px] font-black text-[#F28749] uppercase tracking-[0.2em] mb-2 block">
                  {t('explore.filters.pregnancyLabel', 'Familias embarazadas')}
                </label>
                <button
                  type="button"
                  onClick={() => setIncludePregnant(prev => !prev)}
                  className={`w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 border text-xs font-bold transition-all ${
                    includePregnant
                      ? 'bg-[#F28749] border-[#F28749] text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🤰</span>
                    {t(
                      'explore.filters.pregnancyToggle',
                      'Mostrar también familias en camino',
                    )}
                  </span>
                  <span
                    className={`w-10 h-6 rounded-full relative transition-all ${
                      includePregnant ? 'bg-white/30' : 'bg-black/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                        includePregnant ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </span>
                </button>
              </div>
              <div>
                <label className="text-[9px] font-black text-[#F28749] uppercase tracking-[0.2em] mb-2 block">
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
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-white appearance-none outline-none focus:border-[#F28749]"
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
              <div>
                <label className="text-[9px] font-black text-[#F28749] uppercase tracking-[0.2em] mb-3 block">
                  {t(
                    'explore.filters.interestsLabel',
                    'Filtrar por gustos comunes',
                  )}
                </label>
                <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-1">
                  {availableInterests.map(interest => {
                    const isSelected = selectedInterestIds.includes(interest.id)
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 border min-h-[36px] ${
                          isSelected
                            ? 'bg-white text-gray-900 border-white'
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
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
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full py-4 mt-4 bg-[#F28749] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#e0763d] transition-all shadow-lg min-h-[48px]"
              >
                {t('explore.filters.apply', 'Ver resultados')}
              </button>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE RESULTADOS: RENDERIZADO CONDICIONAL MAPA / GRID */}
        <div className="mt-2">
          {!isVerified && (
            <div className="mb-6 bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-[#F28749] shrink-0" />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-white font-black text-sm">
                  {t(
                    'explore.verifyBannerTitle',
                    'Verifica tu identidad para ver perfiles',
                  )}
                </p>
                <p className="text-white/70 text-xs font-medium">
                  {t(
                    'explore.verifyBannerBody',
                    'Por ahora solo puedes ver cuántas familias hay en el mapa. Verifícate para conocerlas.',
                  )}
                </p>
              </div>
              <Link
                to="/verify-id"
                className="shrink-0 px-5 py-2.5 bg-[#F28749] hover:bg-[#e0763d] text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                {t('explore.verifyBannerCta', 'Verificarme')}
              </Link>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/5 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-white/10">
              <div className="animate-spin h-14 w-14 border-4 border-[#F28749] border-t-transparent rounded-full mb-6" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                {t('explore.loading')}
              </span>
            </div>
          ) : !isVerified ? (
            /* 🗺️ MAPA ANÓNIMO: solo puntos, sin nombre/foto/descripción — nada identificable hasta estar verificada */
            <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl backdrop-blur-md relative z-10">
              <MapContainer
                center={valenciaCenter}
                zoom={13}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapPins.map((pin, i) => (
                  <Marker key={i} position={[pin.latitude, pin.longitude]} />
                ))}
              </MapContainer>
            </div>
          ) : families.length > 0 ? (
            viewMode === 'grid' ? (
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {families.map(f => (
                  <div
                    key={f.id}
                    className="transform hover:-translate-y-2 transition-all duration-500"
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
              /* 🗺️ VISTA B: EL NUEVO MAPA INTERACTIVO DE LEAFLET */
              <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl backdrop-blur-md relative z-10">
                <MapContainer
                  center={valenciaCenter}
                  zoom={13}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {familiesWithCoordinates.map(f => (
                    <Marker key={f.id} position={[f.latitude!, f.longitude!]}>
                      <Popup>
                        <div className="text-center p-1 text-slate-800">
                          {f.profilePictureUrl && (
                            <img
                              src={f.profilePictureUrl}
                              alt={f.familyName}
                              className="w-12 h-12 rounded-full mx-auto object-cover border border-[#F28749] mb-1"
                            />
                          )}
                          <h4 className="font-bold text-sm text-gray-900 m-0">
                            Familia {f.familyName}
                          </h4>
                          <p className="text-[11px] text-gray-600 my-1 line-clamp-2">
                            {f.description}
                          </p>
                          <div className="text-[10px] bg-[#F28749]/10 text-[#F28749] px-2 py-0.5 rounded-md inline-block font-semibold">
                            📍 {f.neighborhoodName}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )
          ) : (
            /* EMPTY STATE PROACTIVO ORIGINAL */
            <div className="text-center py-16 px-6 bg-white/5 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-white/20 animate-in fade-in zoom-in duration-500">
              <div className="bg-[#F28749]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-[#F28749] w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">
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
              <p className="text-white/60 max-w-sm mx-auto mb-8 text-xs font-medium">
                {t(
                  'explore.empty.description',
                  'LittleNeighbors crece con familias como la tuya. ¡Ayúdanos a llenar tu barrio de diversión!',
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchMode === 'neighborhood' && (
                  <button
                    onClick={() => setSearchMode('city')}
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border border-white/20 min-h-[44px]"
                  >
                    {t('explore.empty.expandSearch', 'Ver toda la ciudad')}
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="px-6 py-3.5 bg-[#F28749] hover:bg-[#e0763d] text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Share2 className="w-4 h-4" />
                  {t('explore.empty.inviteNeighbors', 'Invitar vecinos')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
