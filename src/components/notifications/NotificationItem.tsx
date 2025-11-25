import { useNotificationContext } from '../../contexts/NotificationContext'
import { cn } from '../../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NotificationItemProps {
  notification: {
    id: number
    title: string
    message: string
    read_at: string | null
    created_at: string
  }
  onClose: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead } = useNotificationContext()
  const isUnread = !notification.read_at

  const handleClick = () => {
    if (isUnread) {
      markAsRead(notification.id)
    }
    onClose()
  }

  return (
    <div
      className={cn(
        'cursor-pointer px-4 py-3 transition-colors hover:bg-slate-50 rounded-lg mx-2 my-1',
        isUnread && 'bg-blue-50/50 hover:bg-blue-50'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-1.5 h-2 w-2 rounded-full flex-shrink-0',
            isUnread ? 'bg-blue-500 shadow-sm' : 'bg-slate-300'
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              'text-sm font-medium leading-snug',
              isUnread ? 'text-slate-900' : 'text-slate-700'
            )}>
              {notification.title}
            </p>
            {isUnread && (
              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

