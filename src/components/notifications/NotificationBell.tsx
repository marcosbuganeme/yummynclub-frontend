import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '../ui/button'
import { NotificationDropdown } from './NotificationDropdown'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { cn } from '../../lib/utils'

export function NotificationBell() {
  const { unreadCount } = useNotificationContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative h-9 w-9 hover:bg-slate-100 transition-colors",
          isOpen && "bg-slate-100"
        )}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificações"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm',
              unreadCount > 9 && 'px-1 text-[10px]'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

