import { useNotificationContext } from '../../contexts/NotificationContext'
import { NotificationItem } from './NotificationItem'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAllAsRead } = useNotificationContext()
  const navigate = useNavigate()

  const handleViewAll = () => {
    navigate('/notifications')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-600" />
              <DialogTitle className="text-lg font-semibold">Notificações</DialogTitle>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="text-xs h-8 gap-1.5"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">Nenhuma notificação</p>
              <p className="text-xs text-slate-500 text-center">
                Você está em dia! Quando houver novas notificações, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="border-t px-6 py-3 bg-slate-50/50">
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={handleViewAll}
            >
              Ver todas as notificações ({notifications.length})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

