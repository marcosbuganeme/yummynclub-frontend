import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import type { Subscription } from '../../types'

interface SubscriptionsResponse {
  data: Subscription[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface SubscriptionStats {
  total: number
  active: number
  canceled: number
  this_month: number
  revenue_this_month: number
}

export function useAdminSubscriptions(filters?: {
  page?: number
  per_page?: number
  status?: string
  user_id?: number
  plan_id?: number
  date_from?: string
  date_to?: string
}) {
  return useQuery<SubscriptionsResponse>({
    queryKey: ['admin', 'subscriptions', filters],
    queryFn: async () => {
      const response = await api.get('/admin/subscriptions', { params: filters })
      return response.data
    },
  })
}

export function useAdminSubscription(id: string) {
  return useQuery<Subscription>({
    queryKey: ['admin', 'subscriptions', id],
    queryFn: async () => {
      const response = await api.get(`/admin/subscriptions/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useAdminSubscriptionStats() {
  return useQuery<{ data: SubscriptionStats }>({
    queryKey: ['admin', 'subscriptions', 'stats'],
    queryFn: async () => {
      const response = await api.get('/admin/subscriptions/stats')
      return response.data
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/subscriptions/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', 'stats'] })
    },
  })
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/subscriptions/${id}/reactivate`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', 'stats'] })
    },
  })
}

