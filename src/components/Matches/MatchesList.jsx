import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MatchesList.css'

const MatchesList = ({ token }) => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Aquí llamarías a tu servicio de API: messageService.getMyMatches(token)
    // Por ahora, simulamos la respuesta para que puedas ver el botón:
    const fetchMatches = async () => {
      try {
        // Simulación de lo que devolvería tu MatchController
        const mockMatches = [
          { id: 1, neighborName: 'Familia Faye', neighborPhoto: null },
          { id: 2, neighborName: 'Los García', neighborPhoto: null },
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

  if (loading) return <p>Buscando vecinos...</p>

  return (
    <div className="matches-container mt-4">
      <h2 className="text-white uppercase font-black text-xl mb-6 tracking-tighter flex items-center gap-2">
        Mis Conversaciones
        {matches.some(m => m.hasUnread) && (
          <span className="w-2 h-2 bg-brand-orange rounded-full animate-ping" />
        )}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.length === 0 ? (
          <div className="col-span-full py-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/20">
            <p className="text-white/40 italic text-sm">
              Aún no tienes chats abiertos.
            </p>
          </div>
        ) : (
          matches.map(match => (
            <div
              key={match.id}
              className="relative group bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex items-center gap-4 hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => navigate(`/chat/${match.id}`)}
            >
              {/* Badge de Mensaje Nuevo */}
              {match.hasUnread && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange rounded-full border-2 border-brand-dark shadow-lg z-10" />
              )}

              {/* Avatar con inicial y círculo de estado */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-orange to-brand-coral text-white flex items-center justify-center font-black text-xl shadow-inner">
                  {match.neighborName
                    ? match.neighborName.charAt(0).toUpperCase()
                    : '?'}
                </div>
                {/* Indicador de "Vecino Confirmado" */}
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
                <h3 className="text-white font-black text-lg truncate uppercase tracking-tighter">
                  Familia {match.neighborName}
                </h3>

                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  {match.status === 'ACCEPTED' ? (
                    <span className="text-green-400">✓ Vecinos Conectados</span>
                  ) : (
                    <span className="text-brand-orange">
                      💬 Conociéndoos...
                    </span>
                  )}
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-white text-brand-dark p-2 rounded-full shadow-xl">
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
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MatchesList
