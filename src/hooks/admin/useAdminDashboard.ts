import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

interface DashboardStats {
  users: {
    total: number
    active: number
    by_role: Record<string, number>
  }
  partners: {
    total: number
    active: number
    inactive: number
  }
  subscriptions: {
    total: number
    active: number
    canceled: number
  }
  validations: {
    today: number
    this_month: number
    total: number
    success_rate: number
  }
  revenue: {
    this_month: number
    total: number
  }
}

interface DashboardStatsResponse {
  data: DashboardStats
}

export function useAdminDashboard() {
  return useQuery<DashboardStatsResponse>({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard/stats')
      return response.data
    },
  })
}

