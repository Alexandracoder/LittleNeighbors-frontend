import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext' // Importamos nuestro context

export default function Register() {
const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
})
const [error, setError] = useState('')
const [loading, setLoading] = useState(false)
  const { login } = useAuth() // Usamos la función login que ya maneja roles
const navigate = useNavigate()

const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Registro en el Backend
    await authApi.register(formData)

      // 2. Auto-Login: Iniciamos sesión automáticamente con las credenciales recién creadas
      // Esto nos devuelve el objeto User con sus roles gracias a la mejora en AuthContext
    const loggedUser = await login({
        email: formData.email,
        password: formData.password,
    })

    if (loggedUser) {
        // 3. Navegación Inteligente
        // Como es un registro nuevo, lo normal es que NO tenga el rol FAMILY aún
        if (loggedUser.roles.includes('FAMILY')) {
        navigate('/dashboard', { replace: true })
        } else {
        console.log(
            'Nuevo usuario registrado, enviando a completar perfil familiar...',
        )
        navigate('/create-family', { replace: true })
        }
    }
    } catch (err) {
    console.error('Error en el proceso de registro/login:', err)
    setError('Registration failed. Please try again.')
    setLoading(false)
    }
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
}

return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 border-t-8 border-brand-orange">
        <div className="flex justify-center mb-6">
        <div className="bg-brand-orange p-3 rounded-2xl">
            <UserPlus className="w-8 h-8 text-white" />
        </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-brand-coral mb-8">
        Join the Neighborhood
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
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange"
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
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange"
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
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange"
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
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange"
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
            {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
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
    </div>
)
}
