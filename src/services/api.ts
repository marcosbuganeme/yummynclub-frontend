import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não redirecionar se já estamos na página de login ou register
    // Isso evita loops infinitos quando o login falha
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register'
    
    if (error.response?.status === 401 && !isAuthPage) {
      // Token expirado ou inválido - apenas redirecionar se não estiver em página de auth
      localStorage.removeItem('auth_token')
      delete api.defaults.headers.common['Authorization']
      
      // Usar navigate ao invés de window.location.href para evitar reload completo
      // Mas como estamos em um interceptor, vamos verificar se é uma requisição de auth
      const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register')
      
      if (!isAuthRequest) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api;

