import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  CreditCard,
  Package,
} from 'lucide-react'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
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
      href: '/dashboard',
    },
    {
      id: 'partners',
      label: 'Parceiros',
      icon: Building2,
      href: '/partners',
    },
    {
      id: 'validations',
      label: 'Minhas Validações',
      icon: CheckSquare,
      href: '/validations',
    },
    {
      id: 'subscriptions',
      label: 'Assinaturas',
      icon: CreditCard,
      href: '/subscriptions',
    },
    {
      id: 'plans',
      label: 'Planos',
      icon: Package,
      href: '/plans',
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        title="YummyNClub"
        subtitle="Área do Cliente"
        user={{
          name: user?.name || 'Cliente',
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
