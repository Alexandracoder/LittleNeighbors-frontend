import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, ArrowRight } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import registerBg from '../assets/moving.png'

export default function Register() {
  const [showForm, setShowForm] = useState(false)
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

        if (hasFamilyRole) {
          navigate('/dashboard', { replace: true })
        } else {
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* FONDO: Nítido al inicio, sutil blur al abrir formulario */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${registerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: showForm
            ? 'brightness(0.7) blur(4px)'
            : 'brightness(0.95) blur(0px)',
          transform: showForm ? 'scale(1.05)' : 'scale(1)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {!showForm ? (
          /* PANTALLA DE BIENVENIDA ESTILO "SOUL" */
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl italic tracking-tighter">
              Join the Hood
            </h1>
            <p className="text-2xl text-white/90 mb-10 font-medium drop-shadow-lg text-balance">
              Ready to meet your new community?
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-4 mx-auto px-10 py-5 bg-white text-[#F28749] font-black rounded-[2rem] hover:bg-[#F28749] hover:text-white transition-all shadow-2xl active:scale-95"
            >
              <span>CREATE ACCOUNT</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        ) : (
          /* CARD DE REGISTRO UNIFICADA CON EL LAYOUT */
          <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border-t-[10px] border-[#F28749] animate-in slide-in-from-top-10 duration-500">
            <div className="flex justify-center mb-6">
              <div className="bg-[#F28749] p-4 rounded-3xl shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-center text-[#333D47] mb-8 uppercase tracking-tighter">
              New Member
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#F28749] bg-white/50"
                    required
                  />
                </div>
                <div>
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#F28749] bg-white/50"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F28749] w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#F28749] bg-white/50"
                  placeholder="Your email"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F28749] w-5 h-5" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#F28749] bg-white/50"
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
                className="w-full bg-[#F28749] text-white font-black py-5 rounded-2xl shadow-xl hover:opacity-90 transition-all transform hover:-translate-y-1 mt-4 uppercase tracking-widest"
              >
                {loading ? 'Creating...' : 'Join Now'}
              </button>

              <div className="flex flex-col gap-3 mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#F28749] font-bold text-sm hover:underline"
                >
                  Already a neighbor? Log in
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 font-medium text-xs uppercase tracking-widest mt-2"
                >
                  Go Back
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
