import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import type { Partner } from '../types'

interface PartnersFilters {
  category?: string
  search?: string
  latitude?: number
  longitude?: number
  radius?: number
  page?: number
}

interface PartnersResponse {
  data: Partner[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export function usePartners(filters: PartnersFilters = {}) {
  return useQuery<PartnersResponse>({
    queryKey: ['partners', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.latitude) params.append('latitude', filters.latitude.toString())
      if (filters.longitude) params.append('longitude', filters.longitude.toString())
      if (filters.radius) params.append('radius', filters.radius.toString())
      if (filters.page) params.append('page', filters.page.toString())

      const response = await api.get(`/partners?${params.toString()}`)
      return response.data
    },
  })
}

export function usePartner(id: number) {
  return useQuery<{ data: Partner }>({
    queryKey: ['partner', id],
    queryFn: async () => {
      const response = await api.get(`/partners/${id}`)
      return response.data
    },
    enabled: !!id && !isNaN(id) && id > 0,
    retry: 1,
  })
}

export function usePartnerCategories() {
  return useQuery<string[]>({
    queryKey: ['partner-categories'],
    queryFn: async () => {
      const response = await api.get('/partners/categories')
      return response.data.data || []
    },
  })
}

