// src/hooks/useMatches.ts
import { useState, useEffect, useCallback } from 'react'
import matchService from '../services/matchService'

// Definimos la interfaz exacta del DTO que creamos en Java
export interface MatchResponseDetailDTO {
  matchId: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  myChildId: number
  myChildGender: string
  theirChildId: number
  theirChildGender: string
  theirFamilyName: string
  theirNeighborhoodName: string
}

export const useMatches = () => {
  const [matches, setMatches] = useState<MatchResponseDetailDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true)
      const data = await matchService.getMyMatches()
      setMatches(data)
      setError(null)
    } catch (err) {
      setError('Failed to load matches. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleResponse = async (
    matchId: number,
    status: 'ACCEPTED' | 'REJECTED',
  ) => {
    try {
      await matchService.respondToMatch(matchId, status)
      await fetchMatches() // Recargamos la lista tras la acción
    } catch (err: any) {
      alert('Could not update match status: ' + (err.message || 'Error'))
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  return { matches, loading, error, handleResponse, refresh: fetchMatches }
}
