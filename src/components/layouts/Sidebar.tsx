import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { NotificationBell } from '../notifications/NotificationBell'
import {
  ChevronsRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

interface SidebarProps {
  items: SidebarItem[]
  logo?: React.ReactNode
  title?: string
  subtitle?: string
  user?: {
    name: string
    email?: string
    avatar?: string
  }
  onLogout?: () => void
}

export function Sidebar({ items, logo, title, subtitle, user, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()


  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      await logout()
      navigate('/login')
    }
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg bg-white shadow-md border border-slate-100 md:hidden hover:bg-slate-50 transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop collapse button - Fora do sidebar, encostado nele */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'hidden md:flex fixed top-1/2 z-50 p-2 rounded-r-lg bg-white border border-l-0 border-slate-200 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all duration-300 ease-in-out items-center justify-center',
          'transform -translate-y-1/2',
          isOpen ? 'left-64' : 'left-16'
        )}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{
          transition: 'left 0.3s ease-in-out',
        }}
      >
        <ChevronsRight
          className={cn(
            'h-4 w-4 text-slate-600 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-40 transition-all duration-300 ease-in-out flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isOpen ? 'w-64' : 'w-16',
          'md:sticky md:top-0 md:z-auto',
          !isOpen && 'overflow-x-hidden'
        )}
      >
        {/* Header */}
        <div className={cn(
          'relative flex items-center border-b border-slate-200 bg-slate-50/60',
          isOpen ? 'justify-between p-5' : 'justify-center p-3 overflow-x-hidden'
        )}>
          {isOpen ? (
            <>
              <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                {logo || (
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white font-bold text-base">Y</span>
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-slate-800 text-base truncate">{title || 'YummyNClub'}</span>
                  {subtitle && <span className="text-xs text-slate-500 truncate">{subtitle}</span>}
                </div>
              </div>
              {/* Notification Bell no header */}
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <NotificationBell />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-2 w-full overflow-x-hidden">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-white font-bold text-base">Y</span>
                </div>
                {/* Notification Bell quando colapsado */}
                <div className="w-full flex justify-center">
                  <NotificationBell />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn(
          'flex-1 py-2 overflow-y-auto',
          isOpen ? 'px-3' : 'px-0 overflow-x-hidden'
        )}>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setIsMobileOpen(false)
                      }
                    }}
                    className={cn(
                      'w-full flex items-center space-x-2.5 py-2.5 rounded-md text-left transition-all duration-200 group relative',
                      active
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      isOpen ? 'px-3' : 'justify-center px-2 mx-1'
                    )}
                    title={!isOpen ? item.label : undefined}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={cn(
                          'h-4.5 w-4.5 flex-shrink-0',
                          active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                        )}
                      />
                    </div>

                    {isOpen && (
                      <div className="flex items-center justify-between w-full">
                        <span className={cn('text-sm', active ? 'font-medium' : 'font-normal')}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={cn(
                              'px-1.5 py-0.5 text-xs font-medium rounded-full',
                              active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badge for collapsed state */}
                    {!isOpen && item.badge && (
                      <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-blue-100 border border-white">
                        <span className="text-[10px] font-medium text-blue-700">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {!isOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1.5 px-1 py-0.5 bg-slate-700 rounded-full text-[10px]">
                            {item.badge}
                          </span>
                        )}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="mt-auto border-t border-slate-200">
          {/* Profile Section */}
          {user && (
            <div className={cn('border-b border-slate-200 bg-slate-50/30', isOpen ? 'p-3' : 'py-3 px-2')}>
              {isOpen ? (
                <div className="flex items-center px-3 py-2 rounded-md bg-white hover:bg-slate-50 transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 ml-2.5">
                    <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                    {user.email && <p className="text-xs text-slate-500 truncate">{user.email}</p>}
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2" title="Online" />
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <div className={cn(
            isOpen ? 'p-3' : 'p-2'
          )}>
            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center rounded-md text-left transition-all duration-200 group',
                'text-red-600 hover:bg-red-50 hover:text-red-700',
                isOpen ? 'space-x-2.5 px-3 py-2.5' : 'justify-center p-2.5 mx-1'
              )}
              title={!isOpen ? 'Logout' : undefined}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <LogOut className="h-4.5 w-4.5 flex-shrink-0 text-red-500 group-hover:text-red-600" />
              </div>

              {isOpen && <span className="text-sm">Sair</span>}

              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Sair
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

