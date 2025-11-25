import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import type { Validation } from '../../types'

interface ValidationsResponse {
  data: Validation[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface ValidationStats {
  today: number
  this_month: number
  total: number
  by_status: Record<string, number>
  by_type: Record<string, number>
  success_rate: number
}

export function useAdminValidations(filters?: {
  page?: number
  per_page?: number
  status?: string
  user_id?: number
  partner_id?: number
  type?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery<ValidationsResponse>({
    queryKey: ['admin', 'validations', filters],
    queryFn: async () => {
      const response = await api.get('/admin/validations', { params: filters })
      return response.data
    },
  })
}

export function useAdminValidation(id: string) {
  return useQuery<Validation>({
    queryKey: ['admin', 'validations', id],
    queryFn: async () => {
      const response = await api.get(`/admin/validations/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useAdminValidationStats() {
  return useQuery<{ data: ValidationStats }>({
    queryKey: ['admin', 'validations', 'stats'],
    queryFn: async () => {
      const response = await api.get('/admin/validations/stats')
      return response.data
    },
  })
}

