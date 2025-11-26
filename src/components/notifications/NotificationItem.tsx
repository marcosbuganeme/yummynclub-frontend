import { useNotificationContext } from '../../contexts/NotificationContext'
import { cn } from '../../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  CheckCircle2, 
  CreditCard, 
  UserPlus, 
  Store, 
  Bell,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

interface NotificationItemProps {
  notification: {
    id: number
    type?: string
    title: string
    message: string
    read_at: string | null
    created_at: string
  }
  onClose: () => void
}

const getNotificationIcon = (type?: string) => {
  if (!type) return Bell
  
  if (type.includes('validation')) {
    return CheckCircle2
  }
  if (type.includes('subscription')) {
    return CreditCard
  }
  if (type.includes('user')) {
    return UserPlus
  }
  if (type.includes('partner')) {
    return Store
  }
  
  return Bell
}

const getNotificationColor = (type?: string, isUnread?: boolean) => {
  if (!isUnread) {
    return 'text-muted-foreground bg-muted/30'
  }
  
  if (!type) return 'text-blue-600 bg-blue-50'
  
  if (type.includes('validation')) {
    return 'text-green-600 bg-green-50'
  }
  if (type.includes('subscription')) {
    return 'text-purple-600 bg-purple-50'
  }
  if (type.includes('user')) {
    return 'text-blue-600 bg-blue-50'
  }
  if (type.includes('partner')) {
    return 'text-orange-600 bg-orange-50'
  }
  
  return 'text-blue-600 bg-blue-50'
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead } = useNotificationContext()
  const isUnread = !notification.read_at
  const Icon = getNotificationIcon(notification.type)
  const iconColorClass = getNotificationColor(notification.type, isUnread)

  const handleClick = () => {
    if (isUnread) {
      markAsRead(notification.id)
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'cursor-pointer px-4 py-4 transition-all duration-200',
        'border-b border-border/50 last:border-b-0',
        isUnread && 'bg-blue-50/30 hover:bg-blue-50/50'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Ícone com background colorido */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          iconColorClass
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        {/* Conteúdo */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-semibold leading-tight',
                isUnread ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {notification.title}
              </p>
            </div>
            {isUnread && (
              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 animate-pulse" />
            )}
          </div>
          
          <p className={cn(
            'text-sm leading-relaxed',
            isUnread ? 'text-foreground/80' : 'text-muted-foreground'
          )}>
            {notification.message}
          </p>
          
          <div className="flex items-center gap-2 pt-1">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
            {isUnread && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                Nova
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

