import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Declarar Pusher no window para TypeScript
declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: typeof Echo
  }
}

// Configurar Pusher
window.Pusher = Pusher

// Configurar Laravel Echo
const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY || 'your-pusher-key',
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'us2',
  forceTLS: true,
  encrypted: true,
  authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  },
})

export default echo
