import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../contexts/AuthContext'

export default function PartnerDashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Parceiro</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Validações Hoje</CardTitle>
            <CardDescription>Total de validações realizadas hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validações do Mês</CardTitle>
            <CardDescription>Total de validações no mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Status do seu parceiro</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              Ativo
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo, {user?.name}!</CardTitle>
          <CardDescription>Painel de controle do parceiro</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Aqui você pode gerenciar suas validações, visualizar seu QR Code e configurar suas informações.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

