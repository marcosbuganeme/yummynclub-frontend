import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  data?: Record<string, any>
  read_at: string | null
  created_at: string
}

export interface NotificationResponse {
  data: Notification[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface UnreadCountResponse {
  count: number
}

export function useNotifications(filters?: { type?: string; unread_only?: boolean; per_page?: number }) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<NotificationResponse>({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.unread_only) params.append('unread_only', 'true')
      if (filters?.per_page) params.append('per_page', filters.per_page.toString())
      
      const response = await api.get(`/notifications?${params.toString()}`)
      return response.data
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
  })

  const { data: unreadCount } = useQuery<UnreadCountResponse>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get('/notifications/unread-count')
      return response.data
    },
    refetchInterval: 10000, // Refetch a cada 10 segundos
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/notifications/${id}/read`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put('/notifications/read-all')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  return {
    notifications: data?.data || [],
    meta: data?.meta,
    unreadCount: unreadCount?.count || 0,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  }
}

