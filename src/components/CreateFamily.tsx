import familyBg from '../assets/create-family.png'
import React, { useState, useEffect } from 'react'
import { Home, User, FileText, Image, MapPin } from 'lucide-react'

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
      // Reset form after successful creation
      setRepresentativeName('')
      setFamilyName('')
      setDescription('')
      setProfilePictureUrl('')
      setNeighborhoodId(0)
      alert('Family profile created successfully!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating family profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Lado Izquierdo: Imagen */}
        <div className="hidden md:block md:w-1/3 relative">
          <img
            src={familyBg}
            alt="Neighborhood"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-400/40 to-transparent" />
        </div>

        {/* Lado Derecho: Formulario */}
        <div
          className="flex-1 p-8 md:p-12 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${familyBg})`,
          }}
        >
          <div className="max-w-md mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Create Your Family Profile
              </h1>
              <p className="text-gray-600">
                Join your neighbors and start connecting!
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Family Name
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all bg-white/80"
                  placeholder="The Rodriguez Family"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  About Us
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all bg-white/80 h-32"
                  placeholder="Tell us about your family..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all"
              >
                Finish Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
