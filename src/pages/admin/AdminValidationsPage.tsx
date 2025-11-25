import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Loading } from '../../components/ui/loading'
import { ExportButton } from '../../components/export/ExportButton'
import {
  useAdminValidations,
  useAdminValidationStats,
} from '../../hooks/admin/useAdminValidations'

export default function AdminValidationsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [partnerIdFilter, setPartnerIdFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedValidation, setSelectedValidation] = useState<any>(null)

  const filters = {
    page,
    per_page: 15,
    status: statusFilter || undefined,
    user_id: userIdFilter ? parseInt(userIdFilter) : undefined,
    partner_id: partnerIdFilter ? parseInt(partnerIdFilter) : undefined,
    type: typeFilter || undefined,
  }

  const { data, isLoading, error } = useAdminValidations(filters)
  const validations = data?.data || []
  const meta = data?.meta

  const { data: statsData } = useAdminValidationStats()
  const stats = statsData?.data

  useEffect(() => {
    setPage(1)
  }, [statusFilter, userIdFilter, partnerIdFilter, typeFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || colors.expired
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      qr_code: 'QR Code',
      totp: 'TOTP',
      cpf: 'CPF',
    }
    return labels[type as keyof typeof labels] || type
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  // Preparar dados para exportação
  const exportData = validations.map((validation: any) => ({
    ID: validation.id,
    'Usuário': validation.user?.name || 'N/A',
    'Parceiro': validation.partner?.name || 'N/A',
    'Tipo': validation.validation_type,
    'Status': validation.status,
    'Data de Validação': validation.validated_at ? formatDateTime(validation.validated_at) : 'N/A',
    'IP': validation.ip_address || 'N/A',
  }))

  const exportColumns = ['ID', 'Usuário', 'Parceiro', 'Tipo', 'Status', 'Data de Validação', 'IP']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Validações</h2>
        <ExportButton
          data={exportData}
          filename="validacoes"
          columns={exportColumns}
          pdfOptions={{
            title: 'Relatório de Validações',
            subtitle: `Total de ${validations.length} validação(ões)`,
          }}
        />
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.today}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.this_month}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.success_rate}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="success">Sucesso</option>
                <option value="failed">Falhou</option>
                <option value="expired">Expirado</option>
              </select>
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="qr_code">QR Code</option>
                <option value="totp">TOTP</option>
                <option value="cpf">CPF</option>
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
              <Label htmlFor="partner-id">ID do Parceiro</Label>
              <Input
                id="partner-id"
                type="number"
                placeholder="Filtrar por parceiro..."
                value={partnerIdFilter}
                onChange={(e) => setPartnerIdFilter(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Validações</CardTitle>
          <CardDescription>
            {meta && `Mostrando ${validations.length} de ${meta.total} validações`}
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
              Erro ao carregar validações. Tente novamente.
            </div>
          )}

          {!isLoading && !error && (
            <>
              {validations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma validação encontrada.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Usuário</th>
                          <th className="text-left p-2">Parceiro</th>
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Data/Hora</th>
                          <th className="text-right p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validations.map((validation: any) => (
                          <tr key={validation.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">#{validation.id}</td>
                            <td className="p-2">
                              {validation.user ? (
                                <div>
                                  <div className="font-medium">{validation.user.name}</div>
                                  <div className="text-sm text-gray-500">{validation.user.email}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="p-2">
                              {validation.partner ? (
                                <div>
                                  <div className="font-medium">{validation.partner.name}</div>
                                  <div className="text-sm text-gray-500">{validation.partner.category}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="p-2">{getTypeLabel(validation.validation_type)}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(validation.status)}`}>
                                {validation.status === 'success' ? 'Sucesso' :
                                 validation.status === 'failed' ? 'Falhou' : 'Expirado'}
                              </span>
                            </td>
                            <td className="p-2">{formatDate(validation.validated_at)}</td>
                            <td className="p-2">
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedValidation(validation)
                                    setIsDetailsDialogOpen(true)
                                  }}
                                >
                                  Detalhes
                                </Button>
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
            <DialogTitle>Detalhes da Validação</DialogTitle>
            <DialogDescription>
              Informações completas da validação #{selectedValidation?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedValidation && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Status</Label>
                <p className="text-sm">{selectedValidation.status}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Tipo</Label>
                <p className="text-sm">{getTypeLabel(selectedValidation.validation_type)}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Usuário</Label>
                <p className="text-sm">
                  {selectedValidation.user?.name || 'N/A'} ({selectedValidation.user?.email || 'N/A'})
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Parceiro</Label>
                <p className="text-sm">
                  {selectedValidation.partner?.name || 'N/A'} ({selectedValidation.partner?.category || 'N/A'})
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Data/Hora</Label>
                <p className="text-sm">{formatDate(selectedValidation.validated_at)}</p>
              </div>
              {selectedValidation.ip_address && (
                <div>
                  <Label className="text-sm font-semibold">IP</Label>
                  <p className="text-sm">{selectedValidation.ip_address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

