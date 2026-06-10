import { useNavigate } from 'react-router-dom'
import { useMatches, MatchResponseDetailDTO } from '../../hooks/useMatches'
import './MatchesList.css'

interface MatchesListProps {
  token: string | null
}

const MatchesList: React.FC<MatchesListProps> = ({ token }) => {
  const { matches, loading, error, handleResponse } = useMatches()
  const navigate = useNavigate()

  const getInitial = (name: any): string => {
    if (typeof name !== 'string' || name.length === 0) return '?'
    return name.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="py-10 text-center">
        <p className="text-orange-500 animate-pulse font-black uppercase tracking-widest text-xs">
          Searching for neighbors...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-400 font-bold uppercase text-xs">{error}</p>
      </div>
    )
  }

  return (
    <div className="matches-container mt-4">
      <h2 className="text-white uppercase font-black text-xl mb-6 tracking-tighter flex items-center gap-3">
        My Conversations
        {matches.some((m: any) => m.hasUnread) && (
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
              No matches yet. Time to explore the neighborhood!
            </p>
          </div>
        ) : (
          matches.map((match: MatchResponseDetailDTO) => (
            <div key={match.matchId} className="relative group">
              <div
                className={`relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-5 transition-all shadow-xl ${
                  match.status === 'ACCEPTED'
                    ? 'hover:bg-white/10 cursor-pointer hover:scale-[1.02]'
                    : 'cursor-default'
                }`}
                onClick={() =>
                  match.status === 'ACCEPTED' &&
                  navigate(`/chat/${match.matchId}`)
                }
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-lg transform group-hover:rotate-6 transition-transform">
                    {getInitial(match.theirFamilyName)}
                  </div>

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
                    {typeof match.theirFamilyName === 'string'
                      ? `Family ${match.theirFamilyName}`
                      : 'New Neighbor'}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                    <span className="text-white/40">
                      {match.theirNeighborhoodName}
                    </span>
                  </p>

                  <p className="text-[9px] font-black uppercase tracking-[0.1em] mt-2 flex items-center gap-2">
                    {match.status === 'ACCEPTED' ? (
                      <span className="text-green-400/80">● Connected</span>
                    ) : match.status === 'PENDING' ? (
                      <span className="text-orange-400/80">
                        ● Pending Approval
                      </span>
                    ) : (
                      <span className="text-red-400/80">● Declined</span>
                    )}
                  </p>
                </div>

                {match.status === 'ACCEPTED' && (
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
                )}
              </div>

              {match.status === 'PENDING' && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleResponse(match.matchId, 'ACCEPTED')
                    }}
                    className="bg-green-500 hover:bg-green-400 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl transition-all uppercase active:scale-95"
                  >
                    Accept
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleResponse(match.matchId, 'REJECTED')
                    }}
                    className="bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 text-[10px] font-black px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 transition-all uppercase active:scale-95"
                  >
                    Ignore
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MatchesList
