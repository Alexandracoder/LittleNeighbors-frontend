import { MessageCircle, Loader2, MapPin, Heart, Sparkles, User } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { FamilyResponseDTO, InterestResponseDTO } from '../types'
import matchService from '../services/matchService'
import { toast } from 'react-hot-toast'
import { translateNicknameOrDefault } from '../utils/nicknames'

interface FamilyCardProps {
  family: FamilyResponseDTO
  myChildId: number | undefined
  myInterestIds?: number[]
  myNeighborhoodId?: number | null
  myCustomLocationName?: string | null
}

export default function FamilyCard({
  family,
  myChildId,
  myInterestIds = [],
  myNeighborhoodId,
  myCustomLocationName,
}: FamilyCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [connectingChildId, setConnectingChildId] = useState<number | null>(
    null,
  )

  // El backend solo permite conectar dentro del mismo barrio, o si
  // ninguna de las dos tiene barrio de la lista, la misma localidad
  // escrita a mano (ver MatchServiceImpl). Se calcula aquí también para
  // poder avisar de entrada en vez de esperar a que falle la petición —
  // así no depende de que el backend siempre devuelva un mensaje de
  // error legible.
  const canConnect = useMemo(() => {
    if (myNeighborhoodId != null && family.neighborhoodId != null) {
      return myNeighborhoodId === family.neighborhoodId
    }
    if (myNeighborhoodId == null && family.neighborhoodId == null) {
      const mine = myCustomLocationName?.trim().toLowerCase()
      const theirs = family.customLocationName?.trim().toLowerCase()
      return !!mine && !!theirs && mine === theirs
    }
    return false
  }, [
    myNeighborhoodId,
    family.neighborhoodId,
    myCustomLocationName,
    family.customLocationName,
  ])

  const getTranslatedNickname = (nickname: string, gender: string) =>
    translateNicknameOrDefault(nickname, gender, t)

  const sortedInterests = useMemo(() => {
    const all: InterestResponseDTO[] = family.children.flatMap(
      c => c.interests || [],
    )
    const interestMap = new Map<number, InterestResponseDTO>(
      all.map(item => [item.id, item]),
    )

    return Array.from(interestMap.values())
      .sort((a, b) => {
        const aMatch = myInterestIds.includes(a.id) ? 1 : 0
        const bMatch = myInterestIds.includes(b.id) ? 1 : 0
        return bMatch - aMatch
      })
      .slice(0, 6)
  }, [family.children, myInterestIds])

  const handleBreakTheIce = async (targetChildId: number) => {
    if (typeof myChildId !== 'number') {
      toast.error('Selecciona tu perfil de hijo primero para conectar', {
        icon: '👶',
      })
      return
    }

    try {
      setConnectingChildId(targetChildId)
      const newMatch = await matchService.requestMatch(myChildId, targetChildId)
      if (newMatch?.id) {
        toast.success('¡Hielo roto! Abriendo chat de barrio...', { icon: '🎉' })
        navigate(`/chat/${newMatch.id}`, { replace: true })
      }
    } catch (error: any) {
      console.error('Error breaking the ice:', error)

      // matchService ahora deja pasar el error de axios intacto (ver el
      // fix en matchService.ts), así que aquí sí funciona el patrón
      // habitual del resto de la app.
      const backendMessage = error.response?.data?.message

      // Antes, si backendMessage faltaba (fallo de red, respuesta sin
      // cuerpo JSON, etc.), el `|| t('common.error')` cortaba la cadena
      // ahí mismo porque "Error" ya es un string válido y no vacío —
      // nunca se llegaba al mensaje explicativo de más abajo. Se quita
      // ese escalón intermedio para que sí se use.
      toast.error(
        backendMessage ||
          t(
            'family.card.connectErrorFallback',
            'No se pudo enviar la solicitud. Puede que ya no estéis en el mismo barrio, o que haya fallado la conexión — inténtalo de nuevo en un momento.',
          ),
        {
          icon: '🔒',
          duration: 6000,
          style: {
            border: '2px solid #EF4444',
            padding: '16px',
            color: '#B91C1C',
            backgroundColor: '#FEF2F2',
          },
        },
      )
    } finally {
      setConnectingChildId(null)
    }
  }

  return (
    <div className="group bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-2xl transition-all duration-500 hover:bg-white/15 hover:border-white/40 flex flex-col h-full overflow-hidden relative">
      {/* Badge de "Mismo Barrio/Localidad" si se puede conectar */}
      {canConnect && (
        <div className="absolute top-4 right-6 bg-[#F28749] px-3 py-1 rounded-full shadow-lg z-10">
          <span className="text-[8px] font-black text-white uppercase tracking-tighter">
            {t('family.card.sameNeighborhood', 'Vecino')}
          </span>
        </div>
      )}

      <div className="p-8 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
              {t('family.card.namePrefix')} {family.familyName}
            </h3>
            {family.representativeName && (
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-white/40" />
                <span className="text-xs font-bold text-white/70">
                  {family.representativeName}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3 h-3 text-[#F28749]" />
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                {family.neighborhoodName || t('family.card.nearby')}
              </span>
            </div>
          </div>
        </div>

        <p className="text-white/70 text-sm font-medium italic leading-relaxed line-clamp-2 min-h-[40px]">
          "{family.description || t('family.card.descriptionFallback')}"
        </p>
      </div>

      <div className="px-6 py-4 flex flex-col gap-3">
        {canConnect ? (
          <>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[9px] font-black text-[#F28749] uppercase tracking-[0.2em]">
                {t('family.card.selectPlaymate')}
              </span>
              <Sparkles className="w-3 h-3 text-[#F28749]/50" />
            </div>

            {family.children.map(child => {
              const isConnecting = connectingChildId === child.id
              return (
                <button
                  key={child.id}
                  onClick={() => handleBreakTheIce(child.id)}
                  disabled={connectingChildId !== null || !myChildId}
                  className={`flex items-center justify-between p-4 rounded-[1.8rem] border transition-all duration-300 group/item relative overflow-hidden ${
                    isConnecting
                      ? 'bg-white border-white scale-[0.98]'
                      : 'bg-black/30 border-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4 z-10">
                    <span className="text-2xl drop-shadow-md group-hover/item:scale-110 transition-transform">
                      {child.lifeStage === 'PREGNANCY'
                        ? '🤰'
                        : child.gender === 'BOY'
                          ? '👦'
                          : '👧'}
                    </span>
                    <div className="text-left">
                      <div
                        className={`font-black uppercase italic text-sm ${
                          isConnecting ? 'text-[#333D47]' : 'text-white'
                        }`}
                      >
                        {/* APLICAMOS TRADUCCIÓN MÁGICA DE APODOS EN TIEMPO REAL */}
                        {getTranslatedNickname(child.nickname, child.gender)}
                      </div>
                      <div
                        className={`text-[10px] font-bold ${
                          isConnecting ? 'text-[#333D47]/60' : 'text-white/40'
                        }`}
                      >
                        {child.lifeStage === 'PREGNANCY'
                          ? t('family.card.pregnant', 'Embarazada')
                          : child.age === 0
                            ? t('family.card.newborn')
                            : `${child.age} ${t('family.card.yearsOldSuffix')}`}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-2 rounded-full transition-all z-10 ${
                      isConnecting
                        ? 'bg-[#F28749] text-white'
                        : 'bg-white/10 text-white/40 group-hover/item:bg-[#F28749] group-hover/item:text-white'
                    }`}
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4 fill-current" />
                    )}
                  </div>
                </button>
              )
            })}
          </>
        ) : (
          // Solo se puede conectar dentro del mismo barrio (o, si ninguna
          // tiene barrio de la lista, la misma localidad escrita a mano).
          // Antes esto se intentaba igual y el backend lo rechazaba, con
          // un mensaje de error genérico que no explicaba nada. Mejor
          // avisar aquí directamente y no dejar ni intentarlo.
          <div className="flex items-center gap-3 p-4 rounded-[1.8rem] bg-black/20 border border-white/5">
            <MapPin className="w-5 h-5 text-white/30 shrink-0" />
            <p className="text-xs text-white/50 leading-relaxed">
              {t(
                'family.card.differentNeighborhood',
                'Solo puedes conectar con familias de tu mismo barrio o localidad. Podéis ver el perfil, pero no enviar solicitud.',
              )}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER: INTERESES CON MATCHES RESALTADOS */}
      <div className="px-8 py-6 mt-auto border-t border-white/5 bg-black/10">
        <div className="flex flex-wrap gap-2">
          {sortedInterests.map(interest => {
            const isMatch = myInterestIds.includes(interest.id)
            return (
              <span
                key={`int-${interest.id}`}
                className={`text-[9px] font-black uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                  isMatch
                    ? 'bg-white text-[#333D47] border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105'
                    : 'bg-white/5 text-white/30 border-white/5'
                }`}
              >
                {isMatch ? (
                  <Heart className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-pulse" />
                ) : (
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                )}
                {t(`interests.${interest.name.toLowerCase()}`, {
                  defaultValue: interest.name,
                })}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
