import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import echo from '../lib/echo'
import { useQueryClient } from '@tanstack/react-query'

interface NotificationContextType {
  unreadCount: number
  notifications: any[]
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  refreshNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({
    unread_only: false,
    per_page: 50, // Aumentar para evitar perda de notificações
  })

  const [realTimeNotifications, setRealTimeNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    // Escutar canal privado do usuário
    const channel = echo.private(`user.${user.id}`)

    // Escutar eventos de notificação
    channel
      .listen('.user.registered', (data: any) => {
        console.log('User registered:', data)
        // Atualizar notificações
        window.dispatchEvent(new CustomEvent('notification-received', { detail: data }))
      })
      .listen('.subscription.created', (data: any) => {
        console.log('Subscription created:', data)
        window.dispatchEvent(new CustomEvent('notification-received', { detail: data }))
      })
      .listen('.validation.created', (data: any) => {
        console.log('Validation created:', data)
        window.dispatchEvent(new CustomEvent('notification-received', { detail: data }))
      })
      .listen('.partner.status.changed', (data: any) => {
        console.log('Partner status changed:', data)
        window.dispatchEvent(new CustomEvent('notification-received', { detail: data }))
      })

    // Escutar canal admin se for admin
    if (user.role === 'admin') {
      const adminChannel = echo.private('admin')
      
      adminChannel
        .listen('.user.registered', (data: any) => {
          console.log('Admin: User registered:', data)
          window.dispatchEvent(new CustomEvent('notification-received', { detail: data }))
        })
        .listen('.subscription.created', (data: any) => {
          console.log('Admin: Subscription created:', data)
          window.dispatchEvent(new CustomEvent('notification-received', { detail: data }))
        })
        .listen('.validation.created', (data: any) => {
          console.log('Admin: Validation created:', data)
          window.dispatchEvent(new CustomEvent('notification-received', { detail: data }))
        })
        .listen('.partner.status.changed', (data: any) => {
          console.log('Admin: Partner status changed:', data)
          window.dispatchEvent(new CustomEvent('notification-received', { detail: data }))
        })
    }

    // Escutar eventos customizados
    const handleNotification = (event: CustomEvent) => {
      const notificationData = event.detail
      
      // Adicionar notificação em tempo real temporariamente
      setRealTimeNotifications((prev) => {
        // Evitar duplicatas no próprio estado
        const exists = prev.some(n => n.id === notificationData.id)
        if (exists) return prev
        return [notificationData, ...prev].slice(0, 20)
      })
      
      // Invalidar cache e recarregar notificações da API após 1 segundo
      // Isso garante que a notificação do backend seja incluída
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
        
        // Limpar notificações em tempo real após sincronizar com API
        setTimeout(() => {
          setRealTimeNotifications([])
        }, 2000)
      }, 1000)
    }

    window.addEventListener('notification-received', handleNotification as EventListener)

    return () => {
      channel.stopListening('.user.registered')
      channel.stopListening('.subscription.created')
      channel.stopListening('.validation.created')
      channel.stopListening('.partner.status.changed')
      
      if (user.role === 'admin') {
        echo.leave('admin')
      }
      
      echo.leave(`user.${user.id}`)
      window.removeEventListener('notification-received', handleNotification as EventListener)
    }
  }, [user])

  const refreshNotifications = () => {
    window.location.reload()
  }

  // Remover duplicatas baseado no ID da notificação
  // Priorizar notificações da API (mais atualizadas) sobre as em tempo real
  const uniqueNotifications = useMemo(() => {
    const seenIds = new Set<number>()
    const result: any[] = []
    
    // Primeiro adicionar notificações da API (mais confiáveis e atualizadas)
    notifications.forEach((notification) => {
      if (notification.id && !seenIds.has(notification.id)) {
        seenIds.add(notification.id)
        result.push(notification)
      }
    })
    
    // Depois adicionar notificações em tempo real que ainda não estão na API
    // (útil enquanto a API ainda não sincronizou)
    realTimeNotifications.forEach((notification) => {
      if (notification.id && !seenIds.has(notification.id)) {
        seenIds.add(notification.id)
        result.push(notification)
      }
    })
    
    // Ordenar por data de criação (mais recentes primeiro)
    return result.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    })
  }, [notifications, realTimeNotifications])

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications: uniqueNotifications,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context
}

