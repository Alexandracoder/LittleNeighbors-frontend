import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User } from 'lucide-react'
import { authApi } from '../services/api'

export default function Register() {
const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
})
const [error, setError] = useState('')
const [loading, setLoading] = useState(false)
const navigate = useNavigate()

const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
    
await authApi.register(formData)

    navigate('/login', {
        state: { message: 'Account created! Please log in.' },
    })
    } catch (err) {
    setError('Registration failed. Please try again.')
    } finally {
    setLoading(false)
    }
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
}

return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
    <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-brand-orange">
        <div className="flex justify-center mb-6">
            <div className="bg-brand-orange p-4 rounded-3xl shadow-lg shadow-brand-orange/20">
            <UserPlus className="w-12 h-12 text-white" />
            </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-brand-coral mb-2">
            Join the Neighborhood
        </h1>
        <p className="text-center text-brand-dark font-medium mb-8">
            Create your account to start connecting
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-brand-dark mb-1">
                First Name
                </label>
                <input
                type="text"
                name="firstName"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 border border-brand-yellow/30 rounded-2xl focus:ring-2 focus:ring-brand-orange outline-none bg-brand-cream/10"
                placeholder="John"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-brand-dark mb-1">
                Last Name
                </label>
                <input
                type="text"
                name="lastName"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 border border-brand-yellow/30 rounded-2xl focus:ring-2 focus:ring-brand-orange outline-none bg-brand-cream/10"
                placeholder="Doe"
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
                type="email"
                name="email"
                required
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-brand-yellow/30 rounded-2xl focus:ring-2 focus:ring-brand-orange outline-none bg-brand-cream/10"
                placeholder="john@example.com"
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
                type="password"
                name="password"
                required
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-brand-yellow/30 rounded-2xl focus:ring-2 focus:ring-brand-orange outline-none bg-brand-cream/10"
                placeholder="••••••••"
                />
            </div>
            </div>

            {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-2xl text-sm font-medium border border-red-100">
                {error}
            </div>
            )}

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange text-white font-bold py-4 rounded-2xl hover:bg-brand-coral transition-all shadow-lg shadow-brand-orange/30 disabled:opacity-50 text-lg mt-4"
            >
            {loading ? 'Creating account...' : 'Create Account'}
            </button>
        </form>

        <p className="mt-8 text-center text-brand-dark/70 font-medium">
            Already have an account?{' '}
            <button
            onClick={() => navigate('/login')}
            className="text-brand-orange font-bold hover:text-brand-coral hover:underline"
            >
            Sign In
            </button>
        </p>
        </div>
    </div>
    </div>
)
}
