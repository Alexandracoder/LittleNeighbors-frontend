import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { familyApi, neighborhoodApi } from '../services/api'
import type { NeighborhoodResponseDTO } from '../types'
import { Users, MapPin, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import familyBg from '../assets/create-family.png'

export default function CreateFamily() {
  const { t } = useTranslation()
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (neighborhoodId === 0) {
      setError(t('onboarding.createFamily.neighborhoodPlaceholder'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await familyApi.create({
        familyName,
        description,
        neighborhoodId,
        representativeName: 'User', // Puedes cambiarlo por el nombre del usuario si lo tienes
        profilePictureUrl: '',
      })

      // Actualizamos la sesión con los nuevos datos de la familia
      updateSession(
        response.accessToken,
        response.refreshToken,
        response.family,
      )

      navigate('/add-child', { replace: true })
    } catch (err: any) {
      setError(
        err.response?.data?.message || t('onboarding.createFamily.error'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-brand-dark">
      {/* Fondo con imagen y transiciones suaves */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${familyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: showForm ? 'blur(10px) brightness(0.4)' : 'brightness(0.7)',
          transform: showForm ? 'scale(1.05)' : 'scale(1)',
        }}
      />

      <div className="relative z-20 w-full max-w-2xl">
        {!showForm ? (
          /* PANTALLA DE BIENVENIDA (HERO) */
          <div className="text-center animate-in fade-in zoom-in duration-700 flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-xl p-6 rounded-full mb-8 shadow-2xl border border-white/30">
              <Sparkles className="w-16 h-16 text-brand-orange animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] italic uppercase tracking-tighter">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-white font-bold mb-10 drop-shadow-md max-w-md">
              {t('subtitle')}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-4 px-12 py-6 bg-brand-orange text-white font-black rounded-full text-2xl shadow-[0_20px_50px_rgba(234,88,12,0.3)] hover:bg-white hover:text-brand-orange transition-all transform hover:-translate-y-2"
            >
              <span>{t('onboarding.createFamily.submitButton')}</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform w-8 h-8" />
            </button>
          </div>
        ) : (
          /* FORMULARIO DE REGISTRO */
          <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border-t-[12px] border-brand-orange animate-in slide-in-from-bottom-20 duration-500">
            <div className="mb-10 text-center">
              <div className="bg-brand-orange/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-brand-orange w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">
                {t('title')}
              </h2>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-2">
                {t('subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NOMBRE DE FAMILIA */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-brand-dark ml-2">
                  {t('El nom de la teva família')}
                </label>
                <input
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  className="w-full p-5 bg-gray-100 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-3xl outline-none transition-all font-medium"
                  placeholder={t(
                    'Família Martínez',
                  )}
                  required
                />
              </div>

              {/* BARRIO */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-brand-dark ml-2">
                  {/* Si no tienes esta clave en el JSON, la usamos como fallback */}
                  {t(
                    'El teu barri',
                  )}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange w-6 h-6" />
                  <select
                    value={neighborhoodId}
                    onChange={e => setNeighborhoodId(Number(e.target.value))}
                    className="w-full pl-14 pr-6 py-5 bg-gray-100 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-3xl outline-none transition-all font-medium appearance-none text-brand-dark"
                    required
                  >
                    <option value={0}>
                      {t(
                        'Selecciona el teu barri',
                      )}
                    </option>
                    {neighborhoods.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-brand-dark ml-2">
                  {t('Una breu descripció')}
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-5 bg-gray-100 border-2 border-transparent focus:border-brand-orange focus:bg-white rounded-3xl h-32 outline-none transition-all font-medium resize-none"
                  placeholder={t(
                    'Explica una mica sobre la teva família i el que busques',
                  )}
                />
              </div>

              {/* ERRORES */}
              {error && (
                <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl text-sm font-black text-center animate-bounce">
                  {error}
                </div>
              )}

              {/* BOTÓN SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-dark text-white font-black py-6 rounded-3xl shadow-xl hover:bg-brand-orange transition-all transform hover:-translate-y-1 uppercase tracking-[0.2em] text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  t('submitButton')
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
