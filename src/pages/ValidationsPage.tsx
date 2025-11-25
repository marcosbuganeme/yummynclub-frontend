import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useValidations } from '../hooks/useValidations'
import { usePartners } from '../hooks/usePartners'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Loading } from '../components/ui/loading'

export default function ValidationsPage() {
  const navigate = useNavigate()
  
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [partnerFilter, setPartnerFilter] = useState<string>('')
  const [dateFromFilter, setDateFromFilter] = useState<string>('')
  const [dateToFilter, setDateToFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  // Buscar parceiros para o filtro
  const { data: partnersData } = usePartners({ page: 1 })
  const partners = partnersData?.data || []

  // Construir filtros
  const filters: any = { page }
  if (statusFilter) filters.status = statusFilter
  if (partnerFilter) filters.partner_id = Number(partnerFilter)
  if (dateFromFilter) filters.date_from = dateFromFilter
  if (dateToFilter) filters.date_to = dateToFilter
  if (typeFilter) filters.validation_type = typeFilter

  const { data, isLoading, error } = useValidations(filters)

  const validations = data?.data || []
  const meta = data?.meta

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPage(1)
  }, [statusFilter, partnerFilter, dateFromFilter, dateToFilter, typeFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || colors.expired
  }

  const clearFilters = () => {
    setStatusFilter('')
    setPartnerFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    setTypeFilter('')
    setPage(1)
  }

  const hasActiveFilters = statusFilter || partnerFilter || dateFromFilter || dateToFilter || typeFilter

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Histórico de Validações</h2>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Filtro por Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="success">Sucesso</option>
                  <option value="failed">Falhou</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>

              {/* Filtro por Parceiro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parceiro
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={partnerFilter}
                  onChange={(e) => setPartnerFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id.toString()}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="qr_code">QR Code</option>
                  <option value="totp">TOTP</option>
                  <option value="cpf">CPF</option>
                </select>
              </div>

              {/* Filtro por Data (Desde) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Desde
                </label>
                <Input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>

              {/* Filtro por Data (Até) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Até
                </label>
                <Input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Botão Limpar Filtros */}
            {hasActiveFilters && (
              <div className="mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Erro ao carregar validações. Tente novamente.
        </div>
      )}

      {/* Lista de validações */}
      {!isLoading && !error && (
        <>
          {/* Contador de resultados */}
          {meta && (
            <div className="mb-4 text-sm text-gray-600">
              Mostrando {validations.length} de {meta.total} validações
            </div>
          )}

          {validations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {hasActiveFilters 
                  ? 'Nenhuma validação encontrada com os filtros aplicados.' 
                  : 'Nenhuma validação encontrada.'}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              ) : (
                <Button onClick={() => navigate('/partners')}>
                  Ver parceiros disponíveis
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {validations.map((validation) => (
                  <Card key={validation.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {validation.partner?.name || 'Parceiro'}
                          </CardTitle>
                          <CardDescription>
                            {validation.partner?.category || 'Categoria'}
                          </CardDescription>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            validation.status
                          )}`}
                        >
                          {validation.status === 'success' ? 'Sucesso' : 
                           validation.status === 'failed' ? 'Falhou' : 'Expirado'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-semibold text-gray-700">Tipo:</span>{' '}
                            <span className="text-gray-600">
                              {validation.validation_type === 'qr_code' ? 'QR Code' :
                               validation.validation_type === 'totp' ? 'TOTP' : 'CPF'}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold text-gray-700">Data:</span>{' '}
                            <span className="text-gray-600">
                              {formatDate(validation.validated_at)}
                            </span>
                          </p>
                        </div>
                        {validation.partner?.address && (
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-semibold text-gray-700">Endereço:</span>{' '}
                              <span className="text-gray-600">{validation.partner.address}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginação Melhorada */}
              {meta && meta.last_page > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <div className="text-sm text-gray-600">
                    Página {meta.current_page} de {meta.last_page} ({meta.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      ← Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
                        let pageNum: number
                        if (meta.last_page <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= meta.last_page - 2) {
                          pageNum = meta.last_page - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === meta.last_page}
                      onClick={() => setPage(page + 1)}
                    >
                      Próxima →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
