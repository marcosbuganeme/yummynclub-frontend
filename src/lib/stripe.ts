import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'

// Carrega a chave pública do Stripe das variáveis de ambiente
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY não está configurada nas variáveis de ambiente')
}

// Verificar se está em produção e usando HTTPS
const isProduction = import.meta.env.PROD
const isSecure = window.location.protocol === 'https:' || 
                 window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1'

if (isProduction && !isSecure) {
  console.warn('Stripe.js: Em produção, você deve usar HTTPS. O aviso sobre HTTP é apenas para desenvolvimento.')
}

// Carrega o Stripe uma única vez (fora do componente para evitar recriação)
export const stripePromise: Promise<Stripe | null> = loadStripe(
  stripePublishableKey || ''
)

