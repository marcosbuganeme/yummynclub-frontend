import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingPage } from './ui/loading'
import { type UserRole } from '../utils/roles'

interface ProtectedRouteProps {
  children: React.ReactElement
  allowedRoles?: UserRole | UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    // Redirecionar para dashboard baseado no role do usuário
    const roleRoutes: Record<string, string> = {
      client: '/dashboard',
      partner: '/partner/dashboard',
      admin: '/admin/dashboard',
    }
    
    const redirectTo = roleRoutes[user?.role || 'client'] || '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

