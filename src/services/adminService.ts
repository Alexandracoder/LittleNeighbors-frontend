import api from './api'
import { User, FamilyResponseDTO } from '../types'

const adminService = {
  getPendingUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/admin/users/pending')
    return response.data
  },

  verifyUser: async (userId: number): Promise<void> => {
    await api.post(`/admin/moderation/verify/${userId}`)
  },

  blockUser: async (userId: number): Promise<void> => {
    await api.post(`/admin/moderation/block/${userId}`)
  },

  rejectUser: async (userId: number, reason: string): Promise<void> => {
    await api.post(`/admin/moderation/reject/${userId}`, reason, {
      headers: { 'Content-Type': 'text/plain' },
    })
  },

  getPendingPhotos: async (): Promise<FamilyResponseDTO[]> => {
    const response = await api.get<FamilyResponseDTO[]>(
      '/admin/moderation/photos/pending',
    )
    return response.data
  },

  approvePhoto: async (familyId: number): Promise<void> => {
    await api.post(`/admin/moderation/photos/${familyId}/approve`)
  },

  rejectPhoto: async (familyId: number): Promise<void> => {
    await api.post(`/admin/moderation/photos/${familyId}/reject`)
  },
}

export default adminService
