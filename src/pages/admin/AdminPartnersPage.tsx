import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Loading } from '../../components/ui/loading'
import { useToast } from '../../hooks/useToast'
import { ExportButton } from '../../components/export/ExportButton'
import { AddressSelectorLazy } from '../../components/AddressSelectorLazy'
import { QRCodeCopyButton } from '../../components/QRCodeCopyButton'
import { ActionButton } from '../../components/ui/action-button'
import { Edit, QrCode, Power, Trash2, Plus, Building2, Mail, Phone, MapPin, FileText, Tag, CheckCircle2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { Separator } from '../../components/ui/separator'
import {
  useAdminPartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  useTogglePartnerStatus,
  useRegeneratePartnerQrCode,
} from '../../hooks/admin/useAdminPartners'

interface AddressData {
  street?: string
  street_number?: string
  neighborhood?: string
  city?: string
  state?: string
  postal_code?: string
  complement?: string
  reference_points?: string
  formatted_address?: string
  place_id?: string | null
  address_components?: any
  latitude: number
  longitude: number
}

interface PartnerFormData {
  name: string
  email: string
  phone: string
  category: string
  address: string
  latitude: number
  longitude: number
  description: string
  status: 'active' | 'inactive'
  // Novos campos de endereço completo
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zip_code?: string
  address_components?: any
  place_id?: string | null
}

export default function AdminPartnersPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isQrCodeDialogOpen, setIsQrCodeDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    email: '',
    phone: '',
    category: '',
    address: '',
    latitude: 0,
    longitude: 0,
    description: '',
    status: 'active',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    address_components: null,
    place_id: null,
  })
  
  const [addressData, setAddressData] = useState<AddressData>({
    latitude: 0,
    longitude: 0,
  })
  
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  const filters = {
    page,
    per_page: 15,
    search: search || undefined,
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
  }

  const { data, isLoading, error } = useAdminPartners(filters)
  const partners = data?.data || []
  const meta = data?.meta

  const createPartner = useCreatePartner()
  const updatePartner = useUpdatePartner()
  const deletePartner = useDeletePartner()
  const toggleStatus = useTogglePartnerStatus()
  const regenerateQrCode = useRegeneratePartnerQrCode()

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter, statusFilter])

  const handleCreate = async () => {
    try {
      await createPartner.mutateAsync(formData)
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Parceiro criado com sucesso.',
      })
      setIsCreateDialogOpen(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        address: '',
        latitude: 0,
        longitude: 0,
        description: '',
        status: 'active',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        address_components: null,
        place_id: null,
      })
      setAddressData({ latitude: 0, longitude: 0 })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao criar parceiro.',
      })
    }
  }

  const handleEdit = (partner: any) => {
    setSelectedPartner(partner)
    const addressValue: AddressData = {
      street: partner.street || '',
      street_number: partner.number || '',
      neighborhood: partner.neighborhood || '',
      city: partner.city || '',
      state: partner.state || '',
      postal_code: partner.zip_code || '',
      complement: partner.complement || '',
      reference_points: '',
      formatted_address: partner.address || '',
      place_id: partner.place_id || null,
      address_components: partner.address_components || null,
      latitude: partner.latitude || 0,
      longitude: partner.longitude || 0,
    }
    setFormData({
      name: partner.name,
      email: partner.email,
      phone: partner.phone || '',
      category: partner.category,
      address: partner.address || '',
      latitude: partner.latitude || 0,
      longitude: partner.longitude || 0,
      description: partner.description || '',
      status: partner.is_active ? 'active' : 'inactive',
      street: partner.street || '',
      number: partner.number || '',
      complement: partner.complement || '',
      neighborhood: partner.neighborhood || '',
      city: partner.city || '',
      state: partner.state || '',
      zip_code: partner.zip_code || '',
      address_components: partner.address_components || null,
      place_id: partner.place_id || null,
    })
    setAddressData(addressValue)
    setIsEditDialogOpen(true)
  }
  
  const handleAddressChange = (address: AddressData) => {
    setAddressData(address)
    setFormData({
      ...formData,
      address: address.formatted_address || '',
      latitude: address.latitude,
      longitude: address.longitude,
      street: address.street || '',
      number: address.street_number || '',
      complement: address.complement || '',
      neighborhood: address.neighborhood || '',
      city: address.city || '',
      state: address.state || '',
      zip_code: address.postal_code || '',
      address_components: address.address_components || null,
      place_id: address.place_id || null,
    })
  }

  const handleUpdate = async () => {
    if (!selectedPartner) return

    try {
      await updatePartner.mutateAsync({
        id: selectedPartner.id.toString(),
        data: formData,
      })
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Parceiro atualizado com sucesso.',
      })
      setIsEditDialogOpen(false)
      setSelectedPartner(null)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao atualizar parceiro.',
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedPartner) return

    try {
      await deletePartner.mutateAsync(selectedPartner.id.toString())
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Parceiro deletado com sucesso.',
      })
      setIsDeleteDialogOpen(false)
      setSelectedPartner(null)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao deletar parceiro.',
      })
    }
  }

  const handleToggleStatus = async (partner: any) => {
    try {
      await toggleStatus.mutateAsync(partner.id.toString())
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: `Parceiro ${partner.is_active ? 'desativado' : 'ativado'} com sucesso.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao alterar status do parceiro.',
      })
    }
  }

  const handleRegenerateQrCode = async () => {
    if (!selectedPartner) return

    try {
      const result = await regenerateQrCode.mutateAsync(selectedPartner.id.toString())
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'QR Code regenerado com sucesso.',
      })
      setIsQrCodeDialogOpen(false)
      setSelectedPartner({ ...selectedPartner, qr_code: result.data.qr_code })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao regenerar QR Code.',
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Preparar dados para exportação
  const exportData = partners.map((partner: any) => ({
    ID: partner.id,
    Nome: partner.name,
    Email: partner.email,
    Telefone: partner.phone || '',
    Categoria: partner.category,
    Cidade: partner.city || '',
    Estado: partner.state || '',
    Status: partner.is_active ? 'Ativo' : 'Inativo',
    'Data de Criação': formatDate(partner.created_at),
  }))

  const exportColumns = ['ID', 'Nome', 'Email', 'Telefone', 'Categoria', 'Cidade', 'Estado', 'Status', 'Data de Criação']

  // Buscar categorias únicas para o filtro
  const categories = Array.from(new Set(partners.map((p: any) => p.category).filter(Boolean)))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Parceiros</h2>
        <div className="flex items-center gap-3">
          <ExportButton
            data={exportData}
            filename="parceiros"
            columns={exportColumns}
            pdfOptions={{
              title: 'Relatório de Parceiros',
              subtitle: `Total de ${partners.length} parceiro(s)`,
            }}
          />
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Criar Parceiro
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Nome, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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
          <CardTitle>Lista de Parceiros</CardTitle>
          <CardDescription>
            {meta && `Mostrando ${partners.length} de ${meta.total} parceiros`}
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
              Erro ao carregar parceiros. Tente novamente.
            </div>
          )}

          {!isLoading && !error && (
            <>
              {partners.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum parceiro encontrado.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nome</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Categoria</th>
                          <th className="text-left p-2">Endereço</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Cadastro</th>
                          <th className="text-right p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partners.map((partner: any) => (
                          <tr key={partner.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{partner.name}</td>
                            <td className="p-2">{partner.email}</td>
                            <td className="p-2">{partner.category}</td>
                            <td className="p-2">{partner.address || '-'}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${partner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {partner.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="p-2">{formatDate(partner.created_at)}</td>
                            <td className="p-2">
                              <div className="flex justify-end gap-2">
                                <ActionButton
                                  icon={<Edit className="h-4 w-4" />}
                                  label="Editar"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(partner)}
                                />
                                <ActionButton
                                  icon={<QrCode className="h-4 w-4" />}
                                  label="QR Code"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPartner(partner)
                                    setIsQrCodeDialogOpen(true)
                                  }}
                                />
                                <ActionButton
                                  icon={<Power className="h-4 w-4" />}
                                  label={partner.is_active ? 'Desativar' : 'Ativar'}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleStatus(partner)}
                                />
                                <ActionButton
                                  icon={<Trash2 className="h-4 w-4" />}
                                  label="Deletar"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPartner(partner)
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

      {/* Dialog Criar Parceiro */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Criar Novo Parceiro
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do novo parceiro. Todos os campos marcados com <span className="text-red-500">*</span> são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Seção: Informações Básicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Informações Básicas</h3>
              </div>
              
              <div className="space-y-4 pl-6 border-l-2 border-border">
                <div className="space-y-2">
                  <Label htmlFor="create-name" className="text-sm font-medium">
                    Nome do Estabelecimento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="create-name"
                    placeholder="Ex: Restaurante Sabor & Arte"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="create-email"
                        type="email"
                        placeholder="contato@estabelecimento.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-phone" className="text-sm font-medium">
                      Telefone <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="create-phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-category" className="text-sm font-medium">
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    {categories.length > 0 ? (
                      <div className="space-y-2">
                        <Select
                          value={formData.category && categories.includes(formData.category) ? formData.category : ''}
                          onValueChange={(value) => {
                            if (value === '__custom__') {
                              // Se selecionou "adicionar nova", limpar para permitir digitar
                              setFormData({ ...formData, category: '' })
                            } else {
                              setFormData({ ...formData, category: value })
                            }
                          }}
                        >
                          <SelectTrigger id="create-category" className="w-full pl-10">
                            <SelectValue placeholder="Selecione uma categoria existente" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                            <SelectItem value="__custom__">+ Digitar nova categoria</SelectItem>
                          </SelectContent>
                        </Select>
                        {(!formData.category || !categories.includes(formData.category)) && (
                          <Input
                            id="create-category-input"
                            placeholder="Digite uma nova categoria (ex: Restaurante, Loja, Serviço...)"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full"
                            required
                          />
                        )}
                      </div>
                    ) : (
                      <Input
                        id="create-category"
                        placeholder="Ex: Restaurante, Loja, Serviço..."
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full pl-10"
                        required
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione uma categoria existente ou digite uma nova
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção: Localização */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Localização</h3>
              </div>
              
              <div className="space-y-4 pl-6 border-l-2 border-border">
                {googleMapsApiKey ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Endereço <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1">
                      <AddressSelectorLazy
                        value={addressData}
                        onChange={handleAddressChange}
                        apiKey={googleMapsApiKey}
                        defaultCenter={{ lat: -23.5505, lng: -46.6333 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use o mapa para selecionar o endereço ou digite para buscar
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="create-address" className="text-sm font-medium">
                        Endereço Completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="create-address"
                        placeholder="Rua, número, bairro, cidade..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-latitude" className="text-sm font-medium">
                          Latitude
                        </Label>
                        <Input
                          id="create-latitude"
                          type="number"
                          step="any"
                          placeholder="-23.5505"
                          value={formData.latitude || ''}
                          onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-longitude" className="text-sm font-medium">
                          Longitude
                        </Label>
                        <Input
                          id="create-longitude"
                          type="number"
                          step="any"
                          placeholder="-46.6333"
                          value={formData.longitude || ''}
                          onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-md text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                        <p>
                          Configure <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> no .env para usar o seletor de endereço com Google Maps
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Seção: Informações Adicionais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Informações Adicionais</h3>
              </div>
              
              <div className="space-y-4 pl-6 border-l-2 border-border">
                <div className="space-y-2">
                  <Label htmlFor="create-description" className="text-sm font-medium">
                    Descrição
                  </Label>
                  <Textarea
                    id="create-description"
                    placeholder="Descreva o estabelecimento, serviços oferecidos, horários de funcionamento..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Informações adicionais sobre o parceiro (opcional)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-status" className="text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                  >
                    <SelectTrigger id="create-status" className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Parceiros ativos aparecem para os clientes
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false)
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  category: '',
                  address: '',
                  latitude: 0,
                  longitude: 0,
                  description: '',
                  status: 'active',
                  street: '',
                  number: '',
                  complement: '',
                  neighborhood: '',
                  city: '',
                  state: '',
                  zip_code: '',
                  address_components: null,
                  place_id: null,
                })
                setAddressData({ latitude: 0, longitude: 0 })
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={
                createPartner.isPending || 
                !formData.name || 
                !formData.email || 
                !formData.phone || 
                !formData.category
              }
              className="min-w-[120px]"
            >
              {createPartner.isPending ? (
                <>
                  <Loading className="mr-2 h-4 w-4" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Parceiro
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Parceiro */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Parceiro</DialogTitle>
            <DialogDescription>Atualize os dados do parceiro</DialogDescription>
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
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1"
              />
            </div>
            {googleMapsApiKey ? (
              <div>
                <Label>Endereço</Label>
                <div className="mt-1">
                  <AddressSelectorLazy
                    value={addressData}
                    onChange={handleAddressChange}
                    apiKey={googleMapsApiKey}
                    defaultCenter={{ lat: formData.latitude || -23.5505, lng: formData.longitude || -46.6333 }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="edit-address">Endereço</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-latitude">Latitude</Label>
                    <Input
                      id="edit-latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-longitude">Longitude</Label>
                    <Input
                      id="edit-longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded text-sm">
                  ⚠️ Configure VITE_GOOGLE_MAPS_API_KEY no .env para usar o seletor de endereço com Google Maps
                </div>
              </>
            )}
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <textarea
                id="edit-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
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
            <Button onClick={handleUpdate} disabled={updatePartner.isPending}>
              {updatePartner.isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Deletar Parceiro */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o parceiro {selectedPartner?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deletePartner.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog QR Code */}
      <Dialog open={isQrCodeDialogOpen} onOpenChange={setIsQrCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code do Parceiro</DialogTitle>
            <DialogDescription>
              QR Code de {selectedPartner?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPartner?.qr_code && (
              <QRCodeCopyButton
                qrCode={selectedPartner.qr_code}
                partnerName={selectedPartner.name}
                showQRImage={true}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQrCodeDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={handleRegenerateQrCode} disabled={regenerateQrCode.isPending}>
              {regenerateQrCode.isPending ? 'Regenerando...' : 'Regenerar QR Code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
