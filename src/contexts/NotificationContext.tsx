import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import echo from '../lib/echo'

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
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({
    unread_only: false,
    per_page: 10,
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
      setRealTimeNotifications((prev) => [event.detail, ...prev].slice(0, 10))
      // Recarregar notificações após 1 segundo
      setTimeout(() => {
        window.location.reload()
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

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications: [...realTimeNotifications, ...notifications],
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

