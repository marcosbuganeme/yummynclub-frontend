import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Loading } from '../../components/ui/loading'
import { MoneyInput } from '../../components/MoneyInput'
import { useToast } from '../../hooks/useToast'
import { ActionButton } from '../../components/ui/action-button'
import { Edit, Power, Trash2, Plus, DollarSign, Calendar, CreditCard, CheckCircle2, X, Sparkles, Globe, FileText, Tag, Loader2 } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useTogglePlanStatus,
} from '../../hooks/admin/useAdminPlans'

interface PlanFormData {
  name: string
  description: string
  amount: number
  currency: string
  interval: 'day' | 'week' | 'month' | 'year'
  interval_count: number
  stripe_price_id: string
  features: string[]
  is_active: boolean
}

export default function AdminPlansPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    amount: 0,
    currency: 'BRL',
    interval: 'month',
    interval_count: 1,
    stripe_price_id: '',
    features: [],
    is_active: true,
  })
  const [featureInput, setFeatureInput] = useState('')

  const filters = {
    status: statusFilter || undefined,
    search: search || undefined,
  }

  const { data, isLoading, error } = useAdminPlans(filters)
  const plans = data?.data || []

  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()
  const toggleStatus = useTogglePlanStatus()

  const handleCreate = async () => {
    try {
      await createPlan.mutateAsync(formData)
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Plano criado com sucesso.',
      })
      setIsCreateDialogOpen(false)
      setFormData({
        name: '',
        description: '',
        amount: 0,
        currency: 'BRL',
        interval: 'month',
        interval_count: 1,
        stripe_price_id: '',
        features: [],
        is_active: true,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao criar plano.',
      })
    }
  }

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      amount: plan.amount / 100, // Converter de centavos para reais
      currency: plan.currency,
      interval: plan.interval,
      interval_count: plan.interval_count,
      stripe_price_id: plan.stripe_price_id || '',
      features: plan.features || [],
      is_active: plan.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedPlan) return

    try {
      await updatePlan.mutateAsync({
        id: selectedPlan.id.toString(),
        data: formData,
      })
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Plano atualizado com sucesso.',
      })
      setIsEditDialogOpen(false)
      setSelectedPlan(null)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao atualizar plano.',
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedPlan) return

    try {
      await deletePlan.mutateAsync(selectedPlan.id.toString())
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Plano deletado com sucesso.',
      })
      setIsDeleteDialogOpen(false)
      setSelectedPlan(null)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao deletar plano.',
      })
    }
  }

  const handleToggleStatus = async (plan: any) => {
    try {
      await toggleStatus.mutateAsync(plan.id.toString())
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: `Plano ${plan.is_active ? 'desativado' : 'ativado'} com sucesso.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao alterar status do plano.',
      })
    }
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      })
      setFeatureInput('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  const formatPrice = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatInterval = (interval: string, intervalCount: number) => {
    if (interval === 'month') {
      return intervalCount === 1 ? 'mensal' : `a cada ${intervalCount} meses`
    }
    if (interval === 'year') {
      return intervalCount === 1 ? 'anual' : `a cada ${intervalCount} anos`
    }
    return interval
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Criar Plano
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Nome do plano..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Planos</CardTitle>
          <CardDescription>
            {plans.length} plano(s) encontrado(s)
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
              Erro ao carregar planos. Tente novamente.
            </div>
          )}

          {!isLoading && !error && (
            <>
              {plans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum plano encontrado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Descrição</th>
                        <th className="text-left p-2">Valor</th>
                        <th className="text-left p-2">Intervalo</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-right p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((plan: any) => (
                        <tr key={plan.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{plan.name}</td>
                          <td className="p-2">{plan.description || '-'}</td>
                          <td className="p-2">{formatPrice(plan.amount / 100, plan.currency)}</td>
                          <td className="p-2">{formatInterval(plan.interval, plan.interval_count)}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {plan.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex justify-end gap-2">
                              <ActionButton
                                icon={<Edit className="h-4 w-4" />}
                                label="Editar"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(plan)}
                              />
                              <ActionButton
                                icon={<Power className="h-4 w-4" />}
                                label={plan.is_active ? 'Desativar' : 'Ativar'}
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(plan)}
                              />
                              <ActionButton
                                icon={<Trash2 className="h-4 w-4" />}
                                label="Deletar"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedPlan(plan)
                                  setIsDeleteDialogOpen(true)
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog Criar Plano */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white rounded-t-lg">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <DialogTitle className="text-2xl font-bold">Criar Novo Plano</DialogTitle>
              </div>
              <DialogDescription className="text-white/90">
                Configure todas as informações do plano de assinatura
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name" className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    Nome do Plano
                  </Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Plano Premium"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-description">Descrição</Label>
                  <textarea
                    id="create-description"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os benefícios e características do plano..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção: Preço e Cobrança */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Preço e Cobrança</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <MoneyInput
                    id="create-amount"
                    label="Valor"
                    value={formData.amount}
                    onChange={(value) => setFormData({ ...formData, amount: value })}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-currency" className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    Moeda
                  </Label>
                  <select
                    id="create-currency"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-interval" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Intervalo de Cobrança
                  </Label>
                  <select
                    id="create-interval"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value as 'day' | 'week' | 'month' | 'year' })}
                  >
                    <option value="day">Diário</option>
                    <option value="week">Semanal</option>
                    <option value="month">Mensal</option>
                    <option value="year">Anual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-interval-count">Contagem do Intervalo</Label>
                  <Input
                    id="create-interval-count"
                    type="number"
                    min="1"
                    value={formData.interval_count}
                    onChange={(e) => setFormData({ ...formData, interval_count: parseInt(e.target.value) || 1 })}
                    className="h-11"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção: Integração Stripe */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Integração Stripe</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-stripe-price-id">Stripe Price ID</Label>
                <Input
                  id="create-stripe-price-id"
                  value={formData.stripe_price_id}
                  onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                  className="h-11"
                  placeholder="price_xxxxx (Opcional)"
                />
                <p className="text-xs text-gray-500">Deixe em branco para criar automaticamente no Stripe</p>
              </div>
            </div>

            <Separator />

            {/* Seção: Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recursos do Plano</h3>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="create-features"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Digite um recurso e pressione Enter..."
                    className="h-11"
                  />
                  <Button 
                    type="button" 
                    onClick={addFeature}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Seção: Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Power className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Status do Plano</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-status">Status</Label>
                <select
                  id="create-status"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                >
                  <option value="active">Ativo - Disponível para assinatura</option>
                  <option value="inactive">Inativo - Não disponível</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer com botões */}
          <div className="border-t bg-gray-50 px-6 py-4 rounded-b-lg">
            <DialogFooter className="sm:justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                className="h-11"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createPlan.isPending}
                className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {createPlan.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Criar Plano
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Plano */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>Atualize os dados do plano</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <textarea
                id="edit-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <MoneyInput
                id="edit-amount"
                label="Valor"
                value={formData.amount}
                onChange={(value) => setFormData({ ...formData, amount: value })}
                placeholder="0,00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-currency">Moeda</Label>
                <select
                  id="edit-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-interval">Intervalo</Label>
                <select
                  id="edit-interval"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: e.target.value as 'day' | 'week' | 'month' | 'year' })}
                >
                  <option value="day">Dia</option>
                  <option value="week">Semana</option>
                  <option value="month">Mês</option>
                  <option value="year">Ano</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-interval-count">Contagem do Intervalo</Label>
                <Input
                  id="edit-interval-count"
                  type="number"
                  min="1"
                  value={formData.interval_count}
                  onChange={(e) => setFormData({ ...formData, interval_count: parseInt(e.target.value) || 1 })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-stripe-price-id">Stripe Price ID</Label>
              <Input
                id="edit-stripe-price-id"
                value={formData.stripe_price_id}
                onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                className="mt-1"
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label htmlFor="edit-features">Features</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="edit-features"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Adicionar feature..."
                />
                <Button type="button" onClick={addFeature}>Adicionar</Button>
              </div>
              {formData.features.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updatePlan.isPending}>
              {updatePlan.isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Deletar Plano */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o plano {selectedPlan?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deletePlan.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

