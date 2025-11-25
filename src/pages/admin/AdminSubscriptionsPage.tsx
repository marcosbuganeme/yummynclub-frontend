import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { StatCard } from '../../components/ui/stat-card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Loading } from '../../components/ui/loading'
import { useToast } from '../../hooks/useToast'
import { CreditCard, CheckSquare, XCircle, DollarSign } from 'lucide-react'
import { ExportButton } from '../../components/export/ExportButton'
import {
  useAdminSubscriptions,
  useAdminSubscriptionStats,
  useCancelSubscription,
  useReactivateSubscription,
} from '../../hooks/admin/useAdminSubscriptions'

export default function AdminSubscriptionsPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [planIdFilter, setPlanIdFilter] = useState('')
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)

  const filters = {
    page,
    per_page: 15,
    status: statusFilter || undefined,
    user_id: userIdFilter ? parseInt(userIdFilter) : undefined,
    plan_id: planIdFilter ? parseInt(planIdFilter) : undefined,
  }

  const { data, isLoading, error } = useAdminSubscriptions(filters)
  const subscriptions = data?.data || []
  const meta = data?.meta

  const { data: statsData } = useAdminSubscriptionStats()
  const stats = statsData?.data

  const cancelSubscription = useCancelSubscription()
  const reactivateSubscription = useReactivateSubscription()

  useEffect(() => {
    setPage(1)
  }, [statusFilter, userIdFilter, planIdFilter])

  const handleCancel = async () => {
    if (!selectedSubscription) return

    try {
      await cancelSubscription.mutateAsync(selectedSubscription.id.toString())
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Assinatura cancelada com sucesso.',
      })
      setIsCancelDialogOpen(false)
      setSelectedSubscription(null)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao cancelar assinatura.',
      })
    }
  }

  const handleReactivate = async (subscription: any) => {
    try {
      await reactivateSubscription.mutateAsync(subscription.id.toString())
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Assinatura reativada com sucesso.',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao reativar assinatura.',
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPrice = (priceId: string) => {
    // Em produção, você buscaria o preço do Stripe
    return priceId
  }

  const getStatusBadge = (status: string, endsAt: string | null) => {
    if (status === 'active' && (!endsAt || new Date(endsAt) > new Date())) {
      return 'bg-green-100 text-green-800'
    }
    if (status === 'canceled' || (endsAt && new Date(endsAt) <= new Date())) {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-yellow-100 text-yellow-800'
  }

  const isActive = (subscription: any) => {
    return subscription.stripe_status === 'active' &&
           (!subscription.ends_at || new Date(subscription.ends_at) > new Date())
  }

  // Preparar dados para exportação
  const exportData = subscriptions.map((subscription: any) => ({
    ID: subscription.id,
    'ID Stripe': subscription.stripe_id,
    'Status': subscription.stripe_status,
    'Usuário': subscription.user?.name || 'N/A',
    'Email': subscription.user?.email || 'N/A',
    'Quantidade': subscription.quantity || 1,
    'Data de Criação': formatDate(subscription.created_at),
    'Data de Término': subscription.ends_at ? formatDate(subscription.ends_at) : 'N/A',
  }))

  const exportColumns = ['ID', 'ID Stripe', 'Status', 'Usuário', 'Email', 'Quantidade', 'Data de Criação', 'Data de Término']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Assinaturas</h2>
        <ExportButton
          data={exportData}
          filename="assinaturas"
          columns={exportColumns}
          pdfOptions={{
            title: 'Relatório de Assinaturas',
            subtitle: `Total de ${subscriptions.length} assinatura(s)`,
          }}
        />
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total"
            value={stats.total}
            icon={CreditCard}
            iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
          />
          <StatCard
            title="Ativas"
            value={stats.active}
            icon={CheckSquare}
            iconBg="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
          />
          <StatCard
            title="Canceladas"
            value={stats.canceled}
            icon={XCircle}
            iconBg="bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
          />
          <StatCard
            title="Receita Mensal"
            value={`R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(stats.revenue_this_month)}`}
            icon={DollarSign}
            iconBg="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
          />
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="active">Ativa</option>
                <option value="canceled">Cancelada</option>
                <option value="past_due">Atrasada</option>
              </select>
            </div>
            <div>
              <Label htmlFor="user-id">ID do Usuário</Label>
              <Input
                id="user-id"
                type="number"
                placeholder="Filtrar por usuário..."
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="plan-id">ID do Plano</Label>
              <Input
                id="plan-id"
                type="number"
                placeholder="Filtrar por plano..."
                value={planIdFilter}
                onChange={(e) => setPlanIdFilter(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Assinaturas</CardTitle>
          <CardDescription>
            {meta && `Mostrando ${subscriptions.length} de ${meta.total} assinaturas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              Erro ao carregar assinaturas. Tente novamente.
            </div>
          )}

          {!isLoading && !error && (
            <>
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma assinatura encontrada.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Usuário</th>
                          <th className="text-left p-2">Plano</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Valor</th>
                          <th className="text-left p-2">Início</th>
                          <th className="text-left p-2">Término</th>
                          <th className="text-right p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((subscription: any) => (
                          <tr key={subscription.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">#{subscription.id}</td>
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{subscription.user_name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{subscription.user_email || ''}</div>
                              </div>
                            </td>
                            <td className="p-2">{subscription.plan_name || subscription.stripe_price}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(subscription.stripe_status, subscription.ends_at)}`}>
                                {isActive(subscription) ? 'Ativa' :
                                 subscription.stripe_status === 'canceled' ? 'Cancelada' :
                                 subscription.stripe_status}
                              </span>
                            </td>
                            <td className="p-2">
                              {subscription.plan_amount ? `R$ ${(subscription.plan_amount / 100).toFixed(2)}` : formatPrice(subscription.stripe_price)}
                            </td>
                            <td className="p-2">{formatDate(subscription.created_at)}</td>
                            <td className="p-2">{formatDate(subscription.ends_at)}</td>
                            <td className="p-2">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSubscription(subscription)
                                    setIsDetailsDialogOpen(true)
                                  }}
                                >
                                  Detalhes
                                </Button>
                                {isActive(subscription) ? (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSubscription(subscription)
                                      setIsCancelDialogOpen(true)
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReactivate(subscription)}
                                  >
                                    Reativar
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação */}
                  {meta && meta.last_page > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        Página {meta.current_page} de {meta.last_page}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === meta.last_page}
                          onClick={() => setPage(page + 1)}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detalhes */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Assinatura</DialogTitle>
            <DialogDescription>
              Informações completas da assinatura #{selectedSubscription?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Stripe ID</Label>
                <p className="text-sm">{selectedSubscription.stripe_id}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Status</Label>
                <p className="text-sm">{selectedSubscription.stripe_status}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Usuário</Label>
                <p className="text-sm">{selectedSubscription.user_name} ({selectedSubscription.user_email})</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Plano</Label>
                <p className="text-sm">{selectedSubscription.plan_name || selectedSubscription.stripe_price}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Criada em</Label>
                <p className="text-sm">{formatDate(selectedSubscription.created_at)}</p>
              </div>
              {selectedSubscription.ends_at && (
                <div>
                  <Label className="text-sm font-semibold">Termina em</Label>
                  <p className="text-sm">{formatDate(selectedSubscription.ends_at)}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Cancelar */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a assinatura #{selectedSubscription?.id}? Esta ação pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              {cancelSubscription.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

