import React, { useState, useEffect } from 'react'
import { Home, User, FileText, Image, MapPin } from 'lucide-react'
// Adjust the path to the correct location of the 'api' module
import { familyApi, neighborhoodApi } from '../services/api'
import type { NeighborhoodResponseDTO } from '../types'

export default function CreateFamilyProfile() {
  const [representativeName, setRepresentativeName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [description, setDescription] = useState('')
  const [profilePictureUrl, setProfilePictureUrl] = useState('')
  const [neighborhoodId, setNeighborhoodId] = useState<number>(0)
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodResponseDTO[]>(
    [],
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const data = await neighborhoodApi.getAll()
        setNeighborhoods(data)
      } catch (err) {
        console.error('Error fetching neighborhoods:', err)
      }
    }
    fetchNeighborhoods()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await familyApi.create({
        representativeName,
        familyName,
        description,
        profilePictureUrl,
        neighborhoodId,
      })
      // Aquí podrías redirigir al dashboard: window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating family profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* FONDO PRINCIPAL: Crema Suave */
    <div className="min-h-screen bg-[#FDFCF0] p-4 py-12 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* CONTENEDOR DE TU ILUSTRACIÓN: 
            Asegúrate de que la ruta en 'src' sea la correcta para tu imagen */}
        <div className="flex justify-center -mb-16 relative z-10 px-6">
          <img
            src="/assets/neighborhood-illustration.svg"
            alt="Little Neighbors Community"
            className="max-h-52 w-auto drop-shadow-md transform hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* TARJETA DEL FORMULARIO */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 pt-20 border border-[#E0E2DB]">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-[#2F3E46] mb-2">
              Create Your Family Profile
            </h1>
            <p className="text-[#6B9080] font-medium">
              Let your neighbors get to know your family
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* REPRESENTATIVE NAME */}
            <div>
              <label className="block text-sm font-bold text-[#2F3E46] mb-2 ml-1">
                Representative Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B9080]/60 group-focus-within:text-[#FF8C42] transition-colors" />
                <input
                  type="text"
                  value={representativeName}
                  onChange={e => setRepresentativeName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E0E2DB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent transition-all bg-[#F9F7F2]/40"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* FAMILY NAME */}
            <div>
              <label className="block text-sm font-bold text-[#2F3E46] mb-2 ml-1">
                Family Name
              </label>
              <div className="relative group">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B9080]/60 group-focus-within:text-[#FF8C42] transition-colors" />
                <input
                  type="text"
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E0E2DB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent transition-all bg-[#F9F7F2]/40"
                  placeholder="The Doe Family"
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-bold text-[#2F3E46] mb-2 ml-1">
                Description
              </label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-[#6B9080]/60 group-focus-within:text-[#FF8C42] transition-colors" />
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E0E2DB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent transition-all bg-[#F9F7F2]/40 resize-none min-h-[120px]"
                  placeholder="Tell us about your family..."
                  required
                />
              </div>
            </div>

            {/* PHOTO URL */}
            <div>
              <label className="block text-sm font-bold text-[#2F3E46] mb-2 ml-1">
                Profile Picture URL
              </label>
              <div className="relative group">
                <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B9080]/60 group-focus-within:text-[#FF8C42] transition-colors" />
                <input
                  type="url"
                  value={profilePictureUrl}
                  onChange={e => setProfilePictureUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E0E2DB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent transition-all bg-[#F9F7F2]/40"
                  placeholder="https://example.com/photo.jpg"
                  required
                />
              </div>
            </div>

            {/* NEIGHBORHOOD SELECT */}
            <div>
              <label className="block text-sm font-bold text-[#2F3E46] mb-2 ml-1">
                Neighborhood
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B9080]/60 group-focus-within:text-[#FF8C42] transition-colors" />
                <select
                  value={neighborhoodId}
                  onChange={e => setNeighborhoodId(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E0E2DB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent transition-all appearance-none bg-[#F9F7F2]/40 cursor-pointer"
                  required
                >
                  <option value="">Select a neighborhood</option>
                  {neighborhoods.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name} - {n.cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg text-sm animate-shake">
                {error}
              </div>
            )}

            {/* BOTÓN PRINCIPAL: Naranja Coral */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF8C42] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#F07A2E] hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm mt-4"
            >
              {loading ? 'Creating...' : 'Create Family Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
