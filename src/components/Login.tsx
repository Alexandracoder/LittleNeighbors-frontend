import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
// ACTUALIZADO: Tu imagen específica de comunidad conectando
import loginBg from '../assets/community-connecting.png'

export default function Login() {
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ email, password })
      if (user) {
        const roles = user.roles || []
        const isFamily = roles.some((r: any) =>
          typeof r === 'string' ? r === 'FAMILY' : r.name === 'FAMILY',
        )
        // Navegación mágica: si ya tiene familia, al dashboard; si no, a crearla.
        navigate(isFamily ? '/dashboard' : '/create-family', { replace: true })
      }
    } catch (err: any) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* EL ALMA VISUAL: community-connecting.png */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // Empieza nítida y se difumina al pulsar el botón
          filter: showForm
            ? 'blur(8px) brightness(0.6)'
            : 'blur(0px) brightness(0.95)',
          transform: showForm ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {!showForm ? (
          /* PANTALLA DE BIENVENIDA NÍTIDA */
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl italic">
              Hello again!
            </h1>
            <p className="text-2xl text-white/90 mb-10 font-medium drop-shadow-lg text-balance">
              Your neighbors missed you.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-4 mx-auto px-10 py-5 bg-white text-brand-orange font-black rounded-[2rem] hover:bg-brand-orange hover:text-white transition-all shadow-2xl active:scale-95"
            >
              <span>ENTER THE HOOD</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        ) : (
          /* CARD MÁGICA (Aparece con animación) */
          <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border-t-8 border-brand-orange animate-in slide-in-from-top-10 duration-500">
            <div className="flex justify-center mb-6">
              <div className="bg-brand-orange p-4 rounded-3xl shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-center text-brand-coral mb-8 uppercase tracking-tighter">
              Welcome Back
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange bg-white/50"
                  placeholder="Your email"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange bg-white/50"
                  placeholder="Password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange text-white font-black py-5 rounded-2xl shadow-xl hover:bg-brand-coral transition-all transform hover:-translate-y-1"
              >
                {loading ? 'OPENING DOORS...' : 'LOG IN'}
              </button>

              <div className="flex flex-col gap-3 mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-brand-orange font-bold text-sm hover:underline"
                >
                  I'm a new neighbor
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 font-medium text-xs uppercase tracking-widest mt-2"
                >
                  Go Back to view the soul
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
