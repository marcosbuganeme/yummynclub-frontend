import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import type { Plan } from '../../types'

interface PlansResponse {
  data: Plan[]
}

interface CreatePlanData {
  name: string
  description?: string
  amount: number
  currency: string
  interval: 'day' | 'week' | 'month' | 'year'
  interval_count: number
  stripe_price_id?: string
  features?: string[]
  is_active?: boolean
}

interface UpdatePlanData {
  name?: string
  description?: string
  amount?: number
  currency?: string
  interval?: 'day' | 'week' | 'month' | 'year'
  interval_count?: number
  stripe_price_id?: string
  features?: string[]
  is_active?: boolean
}

export function useAdminPlans(filters?: {
  status?: string
  search?: string
}) {
  return useQuery<PlansResponse>({
    queryKey: ['admin', 'plans', filters],
    queryFn: async () => {
      const response = await api.get('/admin/plans', { params: filters })
      return response.data
    },
  })
}

export function useAdminPlan(id: string) {
  return useQuery<Plan>({
    queryKey: ['admin', 'plans', id],
    queryFn: async () => {
      const response = await api.get(`/admin/plans/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePlanData) => {
      const response = await api.post('/admin/plans', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePlanData }) => {
      const response = await api.put(`/admin/plans/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/plans/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useTogglePlanStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/plans/${id}/toggle-status`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

