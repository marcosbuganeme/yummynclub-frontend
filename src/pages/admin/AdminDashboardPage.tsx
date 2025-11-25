import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { BentoGrid } from '../../components/ui/bento-grid'
import { useAuth } from '../../contexts/AuthContext'
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard'
import { useRevenueChart, useSubscriptionsChart, useValidationsChart, useUsersGrowth, useTopPartnersChart } from '../../hooks/admin/useAdminCharts'
import { Skeleton } from '../../components/ui/skeleton'
import { Users, Building2, CreditCard, CheckSquare, DollarSign, Activity } from 'lucide-react'
import { LineChart } from '../../components/charts/LineChart'
import { BarChart } from '../../components/charts/BarChart'
import { PieChart } from '../../components/charts/PieChart'
import { ChartContainer } from '../../components/charts/ChartContainer'
import type { ChartData } from '../../hooks/admin/useAdminCharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error } = useAdminDashboard()
  const [revenuePeriod, setRevenuePeriod] = useState<'3m' | '6m' | '12m'>('3m')
  const [validationsPeriod, setValidationsPeriod] = useState<'1m' | '3m' | '6m'>('1m')
  const [usersPeriod, setUsersPeriod] = useState<'3m' | '6m' | '12m'>('6m')

  const stats = data?.data
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart(revenuePeriod)
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useSubscriptionsChart()
  const { data: validationsData, isLoading: validationsLoading } = useValidationsChart(validationsPeriod)
  const { data: usersGrowthData, isLoading: usersGrowthLoading } = useUsersGrowth(usersPeriod)
  const { data: topPartnersData, isLoading: topPartnersLoading } = useTopPartnersChart()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Administrativo</h2>
      
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Erro ao carregar estatísticas. Tente novamente.
        </div>
      )}

      {!isLoading && !error && stats && (
        <>
          {/* Bento Grid com estatísticas principais */}
          <BentoGrid
            items={[
              {
                title: 'Total de Usuários',
                description: `${stats.users.active} usuários ativos no sistema`,
                icon: <Users className="w-4 h-4 text-blue-500" />,
                meta: stats.users.total.toString(),
                status: 'Ativo',
                tags: ['Usuários', 'Sistema'],
                colSpan: 1,
                hasPersistentHover: true,
              },
              {
                title: 'Parceiros',
                description: `${stats.partners.active} parceiros ativos`,
                icon: <Building2 className="w-4 h-4 text-purple-500" />,
                meta: stats.partners.total.toString(),
                status: 'Ativo',
                tags: ['Parceiros', 'Negócios'],
                colSpan: 1,
              },
              {
                title: 'Assinaturas',
                description: `${stats.subscriptions.active} assinaturas ativas`,
                icon: <CreditCard className="w-4 h-4 text-green-500" />,
                meta: stats.subscriptions.total.toString(),
                status: 'Ativo',
                tags: ['Assinaturas', 'Receita'],
                colSpan: 1,
              },
              {
                title: 'Validações Hoje',
                description: `${stats.validations.this_month} validações este mês`,
                icon: <CheckSquare className="w-4 h-4 text-orange-500" />,
                meta: stats.validations.today.toString(),
                status: 'Hoje',
                tags: ['Validações', 'Atividade'],
                colSpan: 1,
              },
              {
                title: 'Receita do Sistema',
                description: `Receita total acumulada`,
                icon: <DollarSign className="w-4 h-4 text-green-500" />,
                meta: `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(stats.revenue.total)}`,
                status: 'Total',
                tags: ['Financeiro', 'Receita'],
                colSpan: 2,
                hasPersistentHover: true,
                children: (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Este mês:</span>
                      <span className="font-semibold text-green-600">
                        R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(stats.revenue.this_month)}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Estatísticas de Validações',
                description: `Taxa de sucesso e métricas gerais`,
                icon: <Activity className="w-4 h-4 text-blue-500" />,
                meta: `${stats.validations.success_rate}%`,
                status: 'Sucesso',
                tags: ['Validações', 'Métricas'],
                colSpan: 1,
                children: (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold">{stats.validations.total}</span>
                    </div>
                  </div>
                ),
              },
            ]}
            className="mb-6"
          />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartContainer
              title={
                <div className="flex items-center justify-between">
                  <span>Receita ao Longo do Tempo</span>
                  <Select value={revenuePeriod} onValueChange={(v: '3m' | '6m' | '12m') => setRevenuePeriod(v)}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">3 meses</SelectItem>
                      <SelectItem value="6m">6 meses</SelectItem>
                      <SelectItem value="12m">12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
              isLoading={revenueLoading}
            >
              <LineChart
                data={(revenueData?.data || []) as ChartData[]}
                dataKey="value"
                strokeColor="#10b981"
                height={300}
              />
            </ChartContainer>

            <ChartContainer
              title="Distribuição de Assinaturas"
              isLoading={subscriptionsLoading}
            >
              <PieChart
                data={(subscriptionsData?.data || []) as ChartData[]}
                height={300}
              />
            </ChartContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartContainer
              title={
                <div className="flex items-center justify-between">
                  <span>Validações ao Longo do Tempo</span>
                  <Select value={validationsPeriod} onValueChange={(v: '1m' | '3m' | '6m') => setValidationsPeriod(v)}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 mês</SelectItem>
                      <SelectItem value="3m">3 meses</SelectItem>
                      <SelectItem value="6m">6 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
              isLoading={validationsLoading}
            >
              <LineChart
                data={(validationsData?.data || []) as ChartData[]}
                dataKey="value"
                strokeColor="#3b82f6"
                height={300}
              />
            </ChartContainer>

            <ChartContainer
              title={
                <div className="flex items-center justify-between">
                  <span>Crescimento de Usuários</span>
                  <Select value={usersPeriod} onValueChange={(v: '3m' | '6m' | '12m') => setUsersPeriod(v)}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">3 meses</SelectItem>
                      <SelectItem value="6m">6 meses</SelectItem>
                      <SelectItem value="12m">12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
              isLoading={usersGrowthLoading}
            >
              <BarChart
                data={(usersGrowthData?.data || []) as ChartData[]}
                dataKey="value"
                fillColor="#8b5cf6"
                height={300}
              />
            </ChartContainer>
          </div>

          <ChartContainer
            title="Top 10 Parceiros por Validações"
            isLoading={topPartnersLoading}
          >
            <BarChart
              data={(topPartnersData?.data || []) as ChartData[]}
              dataKey="value"
              fillColor="#f59e0b"
              height={300}
            />
          </ChartContainer>

          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo, {user?.name}!</CardTitle>
              <CardDescription>Painel administrativo do YummyNClub</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aqui você pode gerenciar usuários, parceiros, assinaturas e validações do sistema.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
