import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, ArrowRight } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import registerBg from '../assets/moving.png'

export default function Register() {
  const [showForm, setShowForm] = useState(false) // Estado para controlar la visibilidad
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    await authApi.register(formData)
    const loggedUser = await login({
      email: formData.email,
      password: formData.password,
    })

    if (loggedUser) {
      const roles = loggedUser.roles || []
      const hasFamilyRole = roles.some((role: any) => {
        if (typeof role === 'string') return role === 'FAMILY'
        return role?.name === 'FAMILY'
      })

      // FLUJO MEJORADO:
      if (hasFamilyRole) {
        // Si ya tiene familia, va directo al dashboard
        navigate('/dashboard', { replace: true })
      } else {
        // Si es nuevo, lo mandamos a crear su familia.
        // Asegúrate de que CreateFamily.tsx luego redirija a /add-child
        navigate('/create-family', { replace: true })
      }
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Registration failed.')
  } finally {
    setLoading(false)
  }
}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* --- EL ALMA VISUAL: Tu imagen 100% NÍTIDA --- */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000"
        style={{
          backgroundImage: `url(${registerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // El blur solo aumenta un poquito cuando el formulario aparece
          filter: showForm
            ? 'blur(4px) brightness(0.7)'
            : 'blur(0px) brightness(0.9)',
        }}
      />

      {/* --- CONTENIDO DINÁMICO --- */}
      <div className="relative z-20 w-full max-w-md">
        {!showForm ? (
          /* --- PANTALLA DE BIENVENIDA (Imagen clara) --- */
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <h1 className="text-5xl font-black text-white mb-4 drop-shadow-2xl">
              Join the Neighborhood
            </h1>
            <p className="text-xl text-white/90 mb-8 font-medium drop-shadow-lg">
              Ready to meet your new community?
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-3 mx-auto px-8 py-4 bg-brand-orange text-white font-black rounded-2xl hover:bg-brand-coral transition-all shadow-2xl hover:-translate-y-1"
            >
              <span>CREATE ACCOUNT</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          /* --- TU CARD ORIGINAL (Aparece con animación) --- */
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-8 border-t-8 border-brand-orange animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex justify-center mb-6">
              <div className="bg-brand-orange p-3 rounded-2xl">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-brand-coral mb-8">
              New Member
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-brand-dark mb-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange bg-white/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-dark mb-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange bg-white/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-orange" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange bg-white/50"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-orange" />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange bg-white/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange text-white font-bold py-4 rounded-2xl hover:bg-brand-coral transition-all shadow-lg disabled:opacity-50 mt-4"
              >
                {loading ? 'Creating account...' : 'Complete Registration'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already a neighbor?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-brand-orange font-bold hover:underline"
                >
                  Log in
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
