import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  CheckSquare,
  Package,
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
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
      href: '/admin/dashboard',
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      href: '/admin/users',
    },
    {
      id: 'partners',
      label: 'Parceiros',
      icon: Building2,
      href: '/admin/partners',
    },
    {
      id: 'subscriptions',
      label: 'Assinaturas',
      icon: CreditCard,
      href: '/admin/subscriptions',
    },
    {
      id: 'validations',
      label: 'Validações',
      icon: CheckSquare,
      href: '/admin/validations',
    },
    {
      id: 'plans',
      label: 'Planos',
      icon: Package,
      href: '/admin/plans',
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        title="YummyNClub"
        subtitle="Painel Administrativo"
        user={{
          name: user?.name || 'Admin',
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
