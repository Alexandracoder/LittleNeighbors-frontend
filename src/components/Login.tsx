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
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const loggedUser = await login({ email, password })

      if (loggedUser) {
        // Al usar loggedUser.roles directamente, evitamos la latencia del estado de React
        if (
          loggedUser.roles.includes('FAMILY') ||
          loggedUser.roles.includes('ADMIN')
        ) {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/create-family', { replace: true })
        }
      }
    } catch (err) {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gray-900">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
          showForm ? 'scale-105 blur-[1px]' : 'scale-100 blur-0'
        }`}
        style={{ backgroundImage: `url(${welcomeBg})` }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          showForm ? 'bg-brand-cream/40' : 'bg-black/10'
        }`}
      />

      <div className="relative z-20 w-full max-w-md flex flex-col items-center justify-end min-h-screen pb-12">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="group flex flex-col items-center space-y-4 animate-bounce"
          >
            <div className="bg-brand-orange p-5 rounded-full shadow-2xl border-4 border-white/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <span className="bg-white/90 px-8 py-3 rounded-full text-brand-dark font-bold shadow-xl">
              Enter the Neighborhood
            </span>
          </button>
        ) : (
          <div className="w-full bg-white/95 rounded-[3rem] shadow-2xl p-8 border-t-8 border-brand-orange animate-in fade-in slide-in-from-bottom-12">
            <h1 className="text-3xl font-bold text-center text-brand-coral mb-6">
              Little Neighbors
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border rounded-2xl outline-none"
                placeholder="Email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border rounded-2xl outline-none"
                placeholder="Password"
                required
              />
              {error && (
                <p className="text-red-500 text-xs text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange text-white font-bold py-4 rounded-2xl hover:bg-brand-coral disabled:opacity-50"
              >
                {loading ? 'Entering...' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full text-sm text-brand-orange font-bold mt-2"
              >
                Create an account
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
