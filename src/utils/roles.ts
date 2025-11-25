export type UserRole = 'client' | 'partner' | 'admin'

export const ROLES = {
  CLIENT: 'client' as const,
  PARTNER: 'partner' as const,
  ADMIN: 'admin' as const,
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Cliente',
  partner: 'Parceiro',
  admin: 'Administrador',
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  client: '/dashboard',
  partner: '/partner/dashboard',
  admin: '/admin/dashboard',
}

export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole | UserRole[]): boolean {
  if (!userRole) return false
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }
  
  return userRole === requiredRole
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === ROLES.ADMIN
}

export function isPartner(role: UserRole | undefined): boolean {
  return role === ROLES.PARTNER
}

export function isClient(role: UserRole | undefined): boolean {
  return role === ROLES.CLIENT
}

