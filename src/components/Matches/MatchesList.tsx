import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MatchesList.css'

// Definimos qué campos esperamos de un "Match" en la UI
interface NeighborMatch {
  id: number
  neighborName: string
  neighborPhoto: string | null
  hasUnread?: boolean
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface MatchesListProps {
  token?: string | null
  onSelectMatch?: (match: any) => void | Promise<void>; 
}


const MatchesList: React.FC<MatchesListProps> = ({ token }) => {
  
  const [matches, setMatches] = useState<NeighborMatch[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Simulación de datos (Mock) - Asegúrate de que coincidan con la interfaz
        const mockMatches: NeighborMatch[] = [
          {
            id: 1,
            neighborName: 'Faye',
            neighborPhoto: null,
            status: 'ACCEPTED',
            hasUnread: true,
          },
          {
            id: 2,
            neighborName: 'García',
            neighborPhoto: null,
            status: 'PENDING',
            hasUnread: false,
          },
        ]
        setMatches(mockMatches)
      } catch (error) {
        console.error('Error cargando matches', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [token])

  if (loading)
    return (
      <div className="py-10 text-center">
        <p className="text-white/50 animate-pulse font-black uppercase tracking-widest text-xs">
          Buscando vecinos...
        </p>
      </div>
    )

  return (
    <div className="matches-container mt-4">
      <h2 className="text-white uppercase font-black text-xl mb-6 tracking-tighter flex items-center gap-2">
        Mis Conversaciones
        {matches.some(m => m.hasUnread) && (
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
        )}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/20">
            <p className="text-white/40 italic text-sm font-medium">
              Aún no tienes chats abiertos.
            </p>
          </div>
        ) : (
          matches.map(match => (
            <div
              key={match.id}
              className="relative group bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] flex items-center gap-4 hover:bg-white/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              onClick={() => navigate(`/chat/${match.id}`)}
            >
              {/* Badge de Mensaje Nuevo */}
              {match.hasUnread && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full border-2 border-[#1a1a1a] shadow-lg z-10" />
              )}

              {/* Avatar con inicial */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center font-black text-xl shadow-lg">
                  {match.neighborName
                    ? match.neighborName.charAt(0).toUpperCase()
                    : '?'}
                </div>

                {/* Check de Conectados */}
                {match.status === 'ACCEPTED' && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full border-2 border-brand-dark">
                    <svg
                      className="w-2 h-2 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={4}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <h3 className="text-white font-black text-lg truncate uppercase tracking-tighter leading-tight">
                  Familia {match.neighborName}
                </h3>

                <p className="text-[10px] font-black uppercase tracking-widest mt-1">
                  {match.status === 'ACCEPTED' ? (
                    <span className="text-green-400 opacity-90">
                      ✓ Vecinos Conectados
                    </span>
                  ) : (
                    <span className="text-orange-400">💬 Conociéndoos...</span>
                  )}
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                <div className="bg-white text-black p-2 rounded-xl shadow-xl">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MatchesList
