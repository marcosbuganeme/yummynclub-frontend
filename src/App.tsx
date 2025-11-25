import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ClientLayout } from './components/layouts/ClientLayout'
import { PartnerLayout } from './components/layouts/PartnerLayout'
import { AdminLayout } from './components/layouts/AdminLayout'
import { LoadingScreen } from './components/ui/loading-screen'
import { ROLE_ROUTES } from './utils/roles'

// Public pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Client pages
import DashboardPage from './pages/DashboardPage'
import PartnersPage from './pages/PartnersPage'
import PartnerDetailPage from './pages/PartnerDetailPage'
import ValidationsPage from './pages/ValidationsPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import PlansPage from './pages/PlansPage'
import CheckoutPage from './pages/CheckoutPage'
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage'
import NotificationsPage from './pages/NotificationsPage'

// Partner pages
import PartnerDashboardPage from './pages/partner/PartnerDashboardPage'
import PartnerValidationsPage from './pages/partner/PartnerValidationsPage'
import PartnerQRCodePage from './pages/partner/PartnerQRCodePage'

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminPartnersPage from './pages/admin/AdminPartnersPage'
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage'
import AdminValidationsPage from './pages/admin/AdminValidationsPage'
import AdminPlansPage from './pages/admin/AdminPlansPage'

function App() {
  const { isAuthenticated, user, isLoading } = useAuth()

  // Redirect authenticated users to their role-specific dashboard
  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return '/login'
    return ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] || '/dashboard'
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <RegisterPage />
        } 
      />

      {/* Client routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles="client">
            <ClientLayout>
              <DashboardPage />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/partners"
        element={
          <ProtectedRoute allowedRoles="client">
            <ClientLayout>
              <PartnersPage />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/partners/:id"
        element={
          <ProtectedRoute allowedRoles="client">
            <ClientLayout>
              <PartnerDetailPage />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/validations"
        element={
          <ProtectedRoute allowedRoles="client">
            <ClientLayout>
              <ValidationsPage />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute allowedRoles="client">
            <ClientLayout>
              <SubscriptionsPage />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute allowedRoles="client">
            <ClientLayout>
              <PlansPage />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles="client">
            <ClientLayout>
              <CheckoutPage />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription/success"
        element={
          <ProtectedRoute allowedRoles="client">
            <ClientLayout>
              <SubscriptionSuccessPage />
            </ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['client', 'partner', 'admin']}>
            <ClientLayout>
              <NotificationsPage />
            </ClientLayout>
          </ProtectedRoute>
        }
      />

      {/* Partner routes */}
      <Route
        path="/partner/dashboard"
        element={
          <ProtectedRoute allowedRoles="partner">
            <PartnerLayout>
              <PartnerDashboardPage />
            </PartnerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/partner/validations"
        element={
          <ProtectedRoute allowedRoles="partner">
            <PartnerLayout>
              <PartnerValidationsPage />
            </PartnerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/partner/qr-code"
        element={
          <ProtectedRoute allowedRoles="partner">
            <PartnerLayout>
              <PartnerQRCodePage />
            </PartnerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/partner/settings"
        element={
          <ProtectedRoute allowedRoles="partner">
            <PartnerLayout>
              <div className="px-4 py-6 sm:px-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h2>
                <p className="text-gray-600">Página de configurações do parceiro (em desenvolvimento)</p>
              </div>
            </PartnerLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles="admin">
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles="admin">
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/partners"
        element={
          <ProtectedRoute allowedRoles="admin">
            <AdminLayout>
              <AdminPartnersPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscriptions"
        element={
          <ProtectedRoute allowedRoles="admin">
            <AdminLayout>
              <AdminSubscriptionsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/validations"
        element={
          <ProtectedRoute allowedRoles="admin">
            <AdminLayout>
              <AdminValidationsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/plans"
        element={
          <ProtectedRoute allowedRoles="admin">
            <AdminLayout>
              <AdminPlansPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  )
}

export default App
