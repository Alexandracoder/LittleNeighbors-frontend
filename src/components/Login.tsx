import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
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
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-brand-orange">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-orange p-4 rounded-3xl shadow-lg shadow-brand-orange/20">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-center text-brand-coral mb-2">
            Little Neighbors
          </h1>
          <p className="text-center text-brand-dark font-medium mb-8">
            Play. Connect. Belong.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-orange" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-brand-yellow/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all bg-brand-cream/10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-orange" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-brand-yellow/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all bg-brand-cream/10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange text-white font-bold py-4 rounded-2xl hover:bg-brand-coral transition-all shadow-lg shadow-brand-orange/30 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Entering...' : 'Sign In'}
            </button>

            <div className="mt-8 text-center space-y-4">
              <p className="text-brand-dark/70 font-medium">
                New neighbor?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-brand-orange font-bold hover:text-brand-coral hover:underline transition-all"
                >
                  Create an account
                </button>
              </p>

              <p className="text-xs text-brand-dark/50">
                Join the Little Neighbors community today.
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
