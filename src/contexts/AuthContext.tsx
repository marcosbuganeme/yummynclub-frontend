import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api from '../services/api'
import type { User, AuthResponse } from '../types'
import { hasRole as checkRole, isAdmin as checkIsAdmin, isPartner as checkIsPartner, isClient as checkIsClient, type UserRole } from '../utils/roles'
import {
  startPusherBeams,
  setPusherBeamsUserId,
  clearPusherBeamsState,
  createTokenProvider,
} from '../lib/pusherBeams'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, phone: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (role: string | string[]) => boolean
  isAdmin: () => boolean
  isPartner: () => boolean
  isClient: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      const userData = response.data
      setUser(userData)
      
      // Iniciar Pusher Beams quando o usuário já está autenticado (após recarregar página)
      if (userData?.id) {
        try {
          const started = await startPusherBeams()
          
          // Autenticar usuário no Pusher Beams apenas se foi iniciado com sucesso
          if (started) {
            const authEndpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/pusher/beams-auth`
            const tokenProvider = createTokenProvider(authEndpoint, userData.id.toString())
            await setPusherBeamsUserId(userData.id.toString(), tokenProvider)
          }
        } catch (error) {
          // Erro não crítico - não deve interromper o carregamento do usuário
          console.warn('Pusher Beams: Não foi possível configurar completamente ao recarregar página', error)
        }
      }
    } catch (error) {
      localStorage.removeItem('auth_token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password })
    const { user, token } = response.data
    
    setUser(user)
    setToken(token)
    localStorage.setItem('auth_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Iniciar Pusher Beams após login bem-sucedido
    try {
      const started = await startPusherBeams()
      
      // Autenticar usuário no Pusher Beams apenas se foi iniciado com sucesso
      if (started && user?.id) {
        const authEndpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/pusher/beams-auth`
        const tokenProvider = createTokenProvider(authEndpoint, user.id.toString())
        await setPusherBeamsUserId(user.id.toString(), tokenProvider)
      }
    } catch (error) {
      // Erro não crítico - não deve interromper o login
      console.warn('Pusher Beams: Não foi possível configurar completamente', error)
    }
  }

  const register = async (name: string, email: string, phone: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      phone,
      password,
      password_confirmation: password,
    })
    const { user, token } = response.data
    
    setUser(user)
    setToken(token)
    localStorage.setItem('auth_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Iniciar Pusher Beams após registro bem-sucedido
    try {
      const started = await startPusherBeams()
      
      // Autenticar usuário no Pusher Beams apenas se foi iniciado com sucesso
      if (started && user?.id) {
        const authEndpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/pusher/beams-auth`
        const tokenProvider = createTokenProvider(authEndpoint, user.id.toString())
        await setPusherBeamsUserId(user.id.toString(), tokenProvider)
      }
    } catch (error) {
      // Erro não crítico - não deve interromper o registro
      console.warn('Pusher Beams: Não foi possível configurar completamente', error)
    }
  }

  const logout = async () => {
    // Limpar estado do Pusher Beams antes de fazer logout
    try {
      await clearPusherBeamsState()
    } catch (error) {
      console.warn('Erro ao limpar estado do Pusher Beams:', error)
    }
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Ignorar erros no logout
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  const hasRole = (role: string | string[]): boolean => {
    if (!user?.role) return false
    return checkRole(user.role as UserRole, role as UserRole | UserRole[])
  }

  const isAdmin = (): boolean => {
    return checkIsAdmin(user?.role as UserRole | undefined)
  }

  const isPartner = (): boolean => {
    return checkIsPartner(user?.role as UserRole | undefined)
  }

  const isClient = (): boolean => {
    return checkIsClient(user?.role as UserRole | undefined)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated: !!user && !!token,
        hasRole,
        isAdmin,
        isPartner,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
