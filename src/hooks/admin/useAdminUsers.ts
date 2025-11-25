import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: 'client' | 'partner' | 'admin'
  email_verified_at: string | null
  phone_verified_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UsersResponse {
  data: User[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface CreateUserData {
  name: string
  email: string
  phone?: string
  password: string
  role: 'client' | 'partner' | 'admin'
}

interface UpdateUserData {
  name?: string
  email?: string
  phone?: string
  role?: 'client' | 'partner' | 'admin'
}

interface ResetPasswordData {
  password: string
  password_confirmation: string
}

export function useAdminUsers(filters?: {
  page?: number
  per_page?: number
  search?: string
  role?: string
  status?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery<UsersResponse>({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      const response = await api.get('/admin/users', { params: filters })
      return response.data
    },
  })
}

export function useAdminUser(id: string) {
  return useQuery<User>({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await api.post('/admin/users', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const response = await api.put(`/admin/users/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.id] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/users/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/users/${id}/toggle-status`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ResetPasswordData }) => {
      const response = await api.post(`/admin/users/${id}/reset-password`, data)
      return response.data
    },
  })
}

