import { useState } from 'react'
import { useNotificationContext } from '../contexts/NotificationContext'
import { NotificationItem } from '../components/notifications/NotificationItem'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead } = useNotificationContext()
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredNotifications = typeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === typeFilter)

  const unreadNotifications = filteredNotifications.filter(n => !n.read_at)
  const readNotifications = filteredNotifications.filter(n => n.read_at)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="user.registered">Usuários</SelectItem>
              <SelectItem value="subscription.created">Assinaturas</SelectItem>
              <SelectItem value="validation.created">Validações</SelectItem>
              <SelectItem value="partner.status.changed">Parceiros</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button onClick={() => markAllAsRead()} variant="outline">
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {unreadNotifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Não Lidas</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => {}}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {readNotifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Lidas</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {readNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => {}}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Nenhuma notificação encontrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

