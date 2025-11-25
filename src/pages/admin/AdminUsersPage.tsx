import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Loading } from '../../components/ui/loading'
import { useToast } from '../../hooks/useToast'
import { ExportButton } from '../../components/export/ExportButton'
import { ActionButton } from '../../components/ui/action-button'
import { Edit, Trash2, Power, KeyRound, UserPlus } from 'lucide-react'
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useToggleUserStatus,
  useResetUserPassword,
} from '../../hooks/admin/useAdminUsers'

interface UserFormData {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation?: string
  role: 'client' | 'partner' | 'admin'
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client',
  })

  const filters = {
    page,
    per_page: 15,
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  }

  const { data, isLoading, error } = useAdminUsers(filters)
  const users = data?.data || []
  const meta = data?.meta

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const toggleStatus = useToggleUserStatus()
  const resetPassword = useResetUserPassword()

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter, statusFilter])

  const handleCreate = async () => {
    try {
      await createUser.mutateAsync(formData)
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Usuário criado com sucesso.',
      })
      setIsCreateDialogOpen(false)
      setFormData({ name: '', email: '', phone: '', password: '', role: 'client' })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao criar usuário.',
      })
    }
  }

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedUser) return

    try {
      await updateUser.mutateAsync({
        id: selectedUser.id.toString(),
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        },
      })
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Usuário atualizado com sucesso.',
      })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao atualizar usuário.',
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteUser.mutateAsync(selectedUser.id.toString())
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Usuário deletado com sucesso.',
      })
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao deletar usuário.',
      })
    }
  }

  const handleToggleStatus = async (user: any) => {
    try {
      await toggleStatus.mutateAsync(user.id.toString())
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: `Usuário ${user.deleted_at ? 'ativado' : 'desativado'} com sucesso.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao alterar status do usuário.',
      })
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return

    try {
      await resetPassword.mutateAsync({
        id: selectedUser.id.toString(),
        data: {
          password: formData.password,
          password_confirmation: formData.password_confirmation || formData.password,
        },
      })
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Senha resetada com sucesso.',
      })
      setIsResetPasswordDialogOpen(false)
      setSelectedUser(null)
      setFormData({ ...formData, password: '', password_confirmation: '' })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao resetar senha.',
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      partner: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  // Preparar dados para exportação
  const exportData = users.map((user: any) => ({
    ID: user.id,
    Nome: user.name,
    Email: user.email,
    Telefone: user.phone || '',
    Função: user.role,
    Status: user.deleted_at ? 'Inativo' : 'Ativo',
    'Data de Criação': formatDate(user.created_at),
  }))

  const exportColumns = ['ID', 'Nome', 'Email', 'Telefone', 'Função', 'Status', 'Data de Criação']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
        <div className="flex items-center gap-3">
          <ExportButton
            data={exportData}
            filename="usuarios"
            columns={exportColumns}
            pdfOptions={{
              title: 'Relatório de Usuários',
              subtitle: `Total de ${users.length} usuário(s)`,
            }}
          />
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            Criar Usuário
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
                placeholder="Nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="client">Cliente</option>
                <option value="partner">Parceiro</option>
                <option value="admin">Admin</option>
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
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {meta && `Mostrando ${users.length} de ${meta.total} usuários`}
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
              Erro ao carregar usuários. Tente novamente.
            </div>
          )}

          {!isLoading && !error && (
            <>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum usuário encontrado.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nome</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Telefone</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Cadastro</th>
                          <th className="text-right p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user: any) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{user.name}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.phone || '-'}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.deleted_at ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {user.deleted_at ? 'Inativo' : 'Ativo'}
                              </span>
                            </td>
                            <td className="p-2">{formatDate(user.created_at)}</td>
                            <td className="p-2">
                              <div className="flex justify-end gap-2">
                                <ActionButton
                                  icon={<Edit className="h-4 w-4" />}
                                  label="Editar"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                />
                                <ActionButton
                                  icon={<Power className="h-4 w-4" />}
                                  label={user.deleted_at ? 'Ativar' : 'Desativar'}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleStatus(user)}
                                />
                                <ActionButton
                                  icon={<KeyRound className="h-4 w-4" />}
                                  label="Resetar Senha"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setFormData({ ...formData, password: '', password_confirmation: '' })
                                    setIsResetPasswordDialogOpen(true)
                                  }}
                                />
                                <ActionButton
                                  icon={<Trash2 className="h-4 w-4" />}
                                  label="Deletar"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user)
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

      {/* Dialog Criar Usuário */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Criar Novo Usuário
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário. Todos os campos são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name" className="text-sm font-medium">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-name"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-email"
                type="email"
                placeholder="joao@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-phone" className="text-sm font-medium">
                Telefone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password" className="text-sm font-medium">
                Senha <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                A senha deve ter no mínimo 8 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role" className="text-sm font-medium">
                Tipo de Usuário <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as 'client' | 'partner' | 'admin' })}
              >
                <SelectTrigger id="create-role" className="w-full">
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="partner">Parceiro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false)
                setFormData({ name: '', email: '', phone: '', password: '', role: 'client' })
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={createUser.isPending || !formData.name || !formData.email || !formData.phone || !formData.password}
              className="min-w-[100px]"
            >
              {createUser.isPending ? (
                <>
                  <Loading className="mr-2 h-4 w-4" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Usuário */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize os dados do usuário</DialogDescription>
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
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client' | 'partner' | 'admin' })}
              >
                <option value="client">Cliente</option>
                <option value="partner">Parceiro</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Deletar Usuário */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o usuário {selectedUser?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deleteUser.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Resetar Senha */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reset-password">Nova Senha</Label>
              <Input
                id="reset-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reset-password-confirmation">Confirmar Senha</Label>
              <Input
                id="reset-password-confirmation"
                type="password"
                value={formData.password_confirmation || ''}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} disabled={resetPassword.isPending}>
              {resetPassword.isPending ? 'Resetando...' : 'Resetar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
