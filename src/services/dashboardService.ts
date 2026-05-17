import api from './api'

export interface DashboardImpactDTO {
  activeFamiliesCount: number
  consolidatedPlaydatesCount: number
  totalConciliationMinutes: number
}

const dashboardService = {
  getImpactStats: async (): Promise<DashboardImpactDTO> => {
    const response = await api.get<DashboardImpactDTO>(
      '/dashboard/impact-stats',
    )
    return response.data
  },
}

export default dashboardService
