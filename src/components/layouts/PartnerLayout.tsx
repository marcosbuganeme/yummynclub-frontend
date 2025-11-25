import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard,
  CheckSquare,
  ScanLine,
  Settings,
} from 'lucide-react'

interface PartnerLayoutProps {
  children: React.ReactNode
}

export function PartnerLayout({ children }: PartnerLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/partner/dashboard',
    },
    {
      id: 'validations',
      label: 'Validações Recebidas',
      icon: CheckSquare,
      href: '/partner/validations',
    },
    {
      id: 'qr-code',
      label: 'Meu QR Code',
      icon: ScanLine,
      href: '/partner/qr-code',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      href: '/partner/settings',
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        title="YummyNClub"
        subtitle="Área do Parceiro"
        user={{
          name: user?.name || 'Parceiro',
          email: user?.email,
        }}
        onLogout={handleLogout}
      />
      <main 
        className={cn(
          'flex-1 overflow-x-hidden transition-all duration-300 ease-in-out',
          'md:ml-64'
        )}
      >
        <div className="py-4 pr-4 pl-0 md:py-4 md:pr-4 md:pl-0">{children}</div>
      </main>
    </div>
  )
}
