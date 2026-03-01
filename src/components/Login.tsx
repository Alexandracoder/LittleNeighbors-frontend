import welcomeBg from '../assets/community-connecting.png'
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })

      if (hasRole('ROLE_USER')) {
        navigate('/create-family')
      } else if (hasRole('ROLE_FAMILY') || hasRole('ROLE_ADMIN')) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gray-900">
      
      {/* --- CAPA 1: LA IMAGEN (Fondo completo) --- */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${showForm ? 'scale-105 blur-[1px]' : 'scale-100 blur-0'}`}
        style={{
          backgroundImage: `url(${welcomeBg})`,
        }}
      />

      {/* --- CAPA 2: OVERLAY (Filtro suave) --- */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${showForm ? 'bg-brand-cream/40' : 'bg-black/10'}`} />

      {/* --- CAPA 3: CONTENIDO POSICIONADO ABAJO (z-20) --- */}
      <div className="relative z-20 w-full max-w-md flex flex-col items-center justify-end min-h-screen pb-12 md:pb-20">
        
        {!showForm ? (
          /* ESCENARIO A: SOLO BOTÓN (Imagen libre) */
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="group flex flex-col items-center space-y-4 animate-bounce"
          >
            <div className="bg-brand-orange p-5 rounded-full shadow-2xl group-hover:scale-110 transition-transform border-4 border-white/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <span className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-full text-brand-dark font-bold shadow-xl border border-white/50 group-hover:bg-brand-orange group-hover:text-white transition-all">
              Enter the Neighborhood
            </span>
          </button>
        ) : (
          /* ESCENARIO B: FORMULARIO (Aparece al pulsar) */
          <div className="w-full bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl p-8 md:p-10 border-t-8 border-brand-orange animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="flex justify-center mb-4">
              <div className="bg-brand-orange p-2 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center text-brand-coral mb-6">
              Little Neighbors
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-orange" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-brand-yellow/30 rounded-2xl focus:ring-2 focus:ring-brand-orange outline-none bg-brand-cream/10"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-orange" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-brand-yellow/30 rounded-2xl focus:ring-2 focus:ring-brand-orange outline-none bg-brand-cream/10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange text-white font-bold py-4 rounded-2xl hover:bg-brand-coral transition-all shadow-lg text-lg disabled:opacity-50"
              >
                {loading ? 'Entering...' : 'Sign In'}
              </button>

              <div className="flex flex-col space-y-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs text-brand-dark/40 hover:text-brand-orange transition-colors"
                >
                  ← Back to view image
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-sm text-brand-orange font-bold hover:underline"
                >
                  Create an account
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}