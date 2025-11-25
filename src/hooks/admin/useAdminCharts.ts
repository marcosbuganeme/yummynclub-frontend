import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

interface ChartResponse {
  data: ChartData[]
}

export function useRevenueChart(period: '3m' | '6m' | '12m' = '3m') {
  return useQuery<ChartResponse>({
    queryKey: ['admin', 'charts', 'revenue', period],
    queryFn: async () => {
      const response = await api.get(`/admin/charts/revenue?period=${period}`)
      return response.data
    },
  })
}

export function useSubscriptionsChart() {
  return useQuery<ChartResponse>({
    queryKey: ['admin', 'charts', 'subscriptions'],
    queryFn: async () => {
      const response = await api.get('/admin/charts/subscriptions')
      return response.data
    },
  })
}

export function useValidationsChart(period: '1m' | '3m' | '6m' = '1m') {
  return useQuery<ChartResponse>({
    queryKey: ['admin', 'charts', 'validations', period],
    queryFn: async () => {
      const response = await api.get(`/admin/charts/validations?period=${period}`)
      return response.data
    },
  })
}

export function useUsersGrowth(period: '3m' | '6m' | '12m' = '6m') {
  return useQuery<ChartResponse>({
    queryKey: ['admin', 'charts', 'users-growth', period],
    queryFn: async () => {
      const response = await api.get(`/admin/charts/users-growth?period=${period}`)
      return response.data
    },
  })
}

export function useTopPartnersChart() {
  return useQuery<ChartResponse>({
    queryKey: ['admin', 'charts', 'top-partners'],
    queryFn: async () => {
      const response = await api.get('/admin/charts/top-partners')
      return response.data
    },
  })
}
