import api from './api'

export interface DashboardImpactDTO {
  activeFamiliesCount: number
  consolidatedPlaydatesCount: number
  totalConciliationMinutes: number
}

export const dashboardService = {
  getImpactStats: async (): Promise<DashboardImpactDTO> => {

  
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await api.get<DashboardImpactDTO>('/dashboard/impact-stats', {
        signal: controller.signal
      });
      return response.data;
    } catch (error) {
      console.error("Error cargando estadísticas de impacto:", error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },
}
