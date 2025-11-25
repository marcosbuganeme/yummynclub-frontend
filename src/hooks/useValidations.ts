import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import type { Validation } from '../types'

interface ValidationsResponse {
  data: Validation[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface CreateValidationData {
  validation_type: 'qr_code' | 'totp' | 'cpf'
  qr_code?: string
  partner_id?: number
  totp_code?: string
  cpf?: string
}

interface ValidationFilters {
  page?: number
  status?: 'success' | 'failed' | 'expired'
  partner_id?: number
  date_from?: string
  date_to?: string
  validation_type?: 'qr_code' | 'totp' | 'cpf'
}

export function useValidations(filters: ValidationFilters = {}) {
  const { page = 1, ...otherFilters } = filters

  return useQuery<ValidationsResponse>({
    queryKey: ['validations', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      
      if (otherFilters.status) {
        params.append('status', otherFilters.status)
      }
      if (otherFilters.partner_id) {
        params.append('partner_id', otherFilters.partner_id.toString())
      }
      if (otherFilters.date_from) {
        params.append('date_from', otherFilters.date_from)
      }
      if (otherFilters.date_to) {
        params.append('date_to', otherFilters.date_to)
      }
      if (otherFilters.validation_type) {
        params.append('validation_type', otherFilters.validation_type)
      }

      const response = await api.get(`/validations?${params.toString()}`)
      return response.data
    },
  })
}

export function useCreateValidation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateValidationData) => {
      const response = await api.post('/validations', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validations'] })
    },
  })
}

