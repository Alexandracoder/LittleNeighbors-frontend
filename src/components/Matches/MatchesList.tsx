import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// Asegúrate de que este archivo .css exista en la misma carpeta
import './MatchesList.css'

// 1. Definimos la interfaz para el Match de la UI
interface UIBranchMatch {
  id: number
  neighborName: string
  neighborPhoto: string | null
  hasUnread?: boolean
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface MatchesListProps {
  token: string | null
}

const MatchesList: React.FC<MatchesListProps> = ({ token }) => {
  const [matches, setMatches] = useState<UIBranchMatch[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Cuando conectes el backend real, usarás el token para la cabecera
    const fetchMatches = async () => {
      try {
        // Simulación de respuesta del MatchController
        const mockMatches: UIBranchMatch[] = [
          {
            id: 1,
            neighborName: 'Faye',
            neighborPhoto: null,
            hasUnread: true,
            status: 'ACCEPTED',
          },
          {
            id: 2,
            neighborName: 'García',
            neighborPhoto: null,
            hasUnread: false,
            status: 'PENDING',
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
        <p className="text-orange-500 animate-pulse font-black uppercase tracking-widest text-xs">
          Buscando vecinos...
        </p>
      </div>
    )

  return (
    <div className="matches-container mt-4">
      <h2 className="text-white uppercase font-black text-xl mb-6 tracking-tighter flex items-center gap-3">
        Mis Conversaciones
        {matches.some(m => m.hasUnread) && (
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
            <p className="text-white/40 italic text-sm font-medium">
              Aún no tienes chats abiertos. ¡Explora el barrio!
            </p>
          </div>
        ) : (
          matches.map(match => (
            <div
              key={match.id}
              className="relative group bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/10 transition-all cursor-pointer hover:scale-[1.02] shadow-xl"
              onClick={() => navigate(`/chat/${match.id}`)}
            >
              {/* Badge de Mensaje Nuevo */}
              {match.hasUnread && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] z-10" />
              )}

              {/* Avatar con inicial */}
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-lg transform group-hover:rotate-6 transition-transform">
                  {match.neighborName
                    ? match.neighborName.charAt(0).toUpperCase()
                    : '?'}
                </div>

                {/* Check de Vecino Confirmado */}
                {match.status === 'ACCEPTED' && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-full border-4 border-[#1a1a1a]">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <h3 className="text-white font-black text-lg truncate uppercase tracking-tighter">
                  Familia {match.neighborName}
                </h3>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                  {match.status === 'ACCEPTED' ? (
                    <span className="text-green-400/80">Conectados</span>
                  ) : (
                    <span className="text-orange-400/80">Pendiente</span>
                  )}
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <div className="bg-white text-gray-900 p-2 rounded-full shadow-2xl">
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
