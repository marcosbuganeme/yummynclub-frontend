import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { useNavigate } from 'react-router-dom'
import { ROLE_ROUTES } from '../utils/roles'
import { Store, CheckCircle, CreditCard, Mail, Phone } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect based on role
  React.useEffect(() => {
    if (user?.role && user.role !== 'client') {
      const redirectTo = ROLE_ROUTES[user?.role as keyof typeof ROLE_ROUTES]
      if (redirectTo) {
        navigate(redirectTo, { replace: true })
      }
    }
  }, [user, navigate])

  const quickActions = [
    {
      title: 'Ver Parceiros',
      icon: Store,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/partners'),
    },
    {
      title: 'Minhas Validações',
      icon: CheckCircle,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => navigate('/validations'),
    },
    {
      title: 'Minhas Assinaturas',
      icon: CreditCard,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => navigate('/subscriptions'),
    },
  ]

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role?: string) => {
    const labels: Record<string, string> = {
      client: 'Cliente',
      partner: 'Parceiro',
      admin: 'Administrador',
    }
    return labels[role || 'client'] || 'Cliente'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Bem-vindo de volta, {user?.name || 'Usuário'}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de Perfil do Usuário */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 pb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage src={undefined} alt={user?.name || 'Usuário'} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-semibold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl mb-1">{user?.name || 'Usuário'}</CardTitle>
                <CardDescription className="text-sm">{user?.email}</CardDescription>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {getRoleLabel(user?.role)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p className="text-gray-900">{user?.phone || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, idx) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={idx}
                    onClick={action.onClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className={`${action.color} text-white rounded-lg px-6 py-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95`}
                  >
                    <div className="bg-white/20 rounded-lg p-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-lg">{action.title}</span>
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
