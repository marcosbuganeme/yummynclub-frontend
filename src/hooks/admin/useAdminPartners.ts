import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import type { Partner } from '../../types'

interface PartnersResponse {
  data: Partner[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface CreatePartnerData {
  name: string
  email: string
  phone?: string
  category: string
  address?: string
  latitude: number
  longitude: number
  description?: string
  status?: 'active' | 'inactive'
  // Campos detalhados de endereço
  street?: string
  number?: string // Mapeado para street_number no backend
  street_number?: string
  neighborhood?: string
  city?: string
  state?: string
  zip_code?: string // Mapeado para postal_code no backend
  postal_code?: string
  complement?: string
  reference_points?: string
  formatted_address?: string
  place_id?: string | null
  address_components?: any
}

interface UpdatePartnerData {
  name?: string
  email?: string
  phone?: string
  category?: string
  address?: string
  latitude?: number
  longitude?: number
  description?: string
  status?: 'active' | 'inactive'
  // Campos detalhados de endereço
  street?: string
  number?: string // Mapeado para street_number no backend
  street_number?: string
  neighborhood?: string
  city?: string
  state?: string
  zip_code?: string // Mapeado para postal_code no backend
  postal_code?: string
  complement?: string
  reference_points?: string
  formatted_address?: string
  place_id?: string | null
  address_components?: any
}

export function useAdminPartners(filters?: {
  page?: number
  per_page?: number
  search?: string
  category?: string
  status?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery<PartnersResponse>({
    queryKey: ['admin', 'partners', filters],
    queryFn: async () => {
      const response = await api.get('/admin/partners', { params: filters })
      return response.data
    },
  })
}

export function useAdminPartner(id: string) {
  return useQuery<Partner>({
    queryKey: ['admin', 'partners', id],
    queryFn: async () => {
      const response = await api.get(`/admin/partners/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreatePartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePartnerData) => {
      const response = await api.post('/admin/partners', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] })
    },
  })
}

export function useUpdatePartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePartnerData }) => {
      const response = await api.put(`/admin/partners/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners', variables.id] })
    },
  })
}

export function useDeletePartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/partners/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] })
    },
  })
}

export function useTogglePartnerStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/partners/${id}/toggle-status`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] })
    },
  })
}

export function useRegeneratePartnerQrCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/partners/${id}/regenerate-qr-code`)
      return response.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners', id] })
    },
  })
}

