import * as PusherPushNotifications from '@pusher/push-notifications-web'

const instanceId = '6262ac49-2f7a-42d8-aee6-1719658a8bfa'

let beamsClient: PusherPushNotifications.Client | null = null
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null

/**
 * Registra o Service Worker necessário para Pusher Beams
 * Deve ser chamado antes de iniciar o cliente
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    // Verificar se já existe um service worker registrado
    const existingRegistration = await navigator.serviceWorker.getRegistration('/service-worker.js')
    if (existingRegistration) {
      serviceWorkerRegistration = existingRegistration
      return existingRegistration
    }

    // Registrar o service worker
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    })

    // Aguardar o service worker estar ativo
    if (registration.installing) {
      await new Promise<void>((resolve) => {
        registration.installing!.addEventListener('statechange', () => {
          if (registration.installing!.state === 'activated') {
            resolve()
          }
        })
      })
    } else if (registration.waiting) {
      // Se já está waiting, tentar ativar
      await registration.update()
    } else if (registration.active) {
      // Já está ativo
    }

    serviceWorkerRegistration = registration
    console.log('Pusher Beams: Service Worker registrado com sucesso')
    return registration
  } catch (error: any) {
    console.warn('Pusher Beams: Erro ao registrar Service Worker:', error?.message || error)
    return null
  }
}

/**
 * Inicializa o cliente Pusher Beams
 * @param registrationParam Opcional: Service Worker já registrado
 */
export function initializePusherBeams(
  registrationParam?: ServiceWorkerRegistration
): PusherPushNotifications.Client {
  if (beamsClient) {
    return beamsClient
  }

  // Usar o registration passado como parâmetro ou o global já registrado
  const registration = registrationParam || serviceWorkerRegistration

  beamsClient = new PusherPushNotifications.Client({
    instanceId,
    serviceWorkerRegistration: registration || undefined,
  })

  return beamsClient
}

/**
 * Verifica se o navegador suporta push notifications
 * Verifica suporte específico para diferentes navegadores
 * Push notifications requerem HTTPS (exceto localhost)
 */
function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false
  
  // Verificar se está em HTTPS ou localhost
  const isSecure = window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.endsWith('.localhost')
  
  if (!isSecure) {
    console.warn('Pusher Beams: Push notifications requerem HTTPS (exceto localhost)')
    return false
  }
  
  // Verificar se Service Worker está disponível
  if (!('serviceWorker' in navigator)) {
    console.warn('Pusher Beams: Service Worker não suportado neste navegador')
    return false
  }
  
  // Verificar se Push Manager está disponível
  if (!('PushManager' in window)) {
    console.warn('Pusher Beams: Push Manager não suportado neste navegador')
    return false
  }
  
  // Verificar se Notification está disponível
  if (!('Notification' in window)) {
    console.warn('Pusher Beams: Notifications API não suportada neste navegador')
    return false
  }

  // Verificações específicas por navegador
  const userAgent = navigator.userAgent.toLowerCase()
  
  // Chrome/Chromium/Edge (Chromium-based)
  if (userAgent.includes('chrome') || userAgent.includes('chromium') || userAgent.includes('edg')) {
    // Chrome/Chromium suporta push notifications
    return true
  }
  
  // Firefox
  if (userAgent.includes('firefox')) {
    // Firefox suporta push notifications desde versão 44+
    return true
  }
  
  // Safari
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    // Safari suporta push notifications desde iOS 16.4+ e macOS 13+
    // Mas requer configuração específica com certificado APNs
    console.warn('Pusher Beams: Safari requer configuração adicional com certificado APNs')
    return true // Retornar true mas avisar sobre configuração necessária
  }
  
  // Opera
  if (userAgent.includes('opera') || userAgent.includes('opr')) {
    return true
  }
  
  // Brave (baseado em Chromium)
  if (userAgent.includes('brave')) {
    return true
  }
  
  // Internet Explorer / Edge Legacy (não suportado)
  if (userAgent.includes('msie') || userAgent.includes('trident')) {
    console.warn('Pusher Beams: Internet Explorer não é suportado')
    return false
  }
  
  // Navegador desconhecido - tentar mesmo assim
  console.warn('Pusher Beams: Navegador não identificado, tentando iniciar mesmo assim')
  return true
}

/**
 * Inicia o Pusher Beams e solicita permissão de notificações
 * Registra o service worker automaticamente se necessário
 * Apenas inicia se o navegador suportar push notifications
 * @returns true se iniciado com sucesso, false caso contrário
 */
export async function startPusherBeams(): Promise<boolean> {
  // Verificar suporte antes de tentar iniciar
  if (!isPushNotificationSupported()) {
    console.warn('Pusher Beams: Push notifications não são suportadas neste navegador')
    return false
  }

  try {
    // Registrar service worker ANTES de iniciar o cliente
    const registration = await registerServiceWorker()
    
    if (!registration) {
      console.warn('Pusher Beams: Não foi possível registrar o Service Worker')
      return false
    }

    // Inicializar cliente com o service worker registration
    const client = initializePusherBeams(registration)
    
    // Iniciar o cliente
    await client.start()
    
    console.log('Pusher Beams iniciado com sucesso')
    return true
  } catch (error: any) {
    // Se o erro for relacionado a push notifications não suportadas, apenas logar warning
    if (error?.message?.includes('Push service endpoint not supported') || 
        error?.message?.includes('unsupported browser') ||
        error?.message?.includes('not supported')) {
      console.warn('Pusher Beams: Push notifications não são suportadas neste navegador ou configuração:', error?.message)
      return false
    }
    
    console.warn('Pusher Beams: Erro ao iniciar', error?.message || error)
    return false
  }
}

/**
 * Define o ID do usuário autenticado no Pusher Beams
 * Isso permite enviar notificações para um usuário específico
 * @returns true se autenticado com sucesso, false caso contrário
 */
export async function setPusherBeamsUserId(
  userId: string,
  tokenProvider: PusherPushNotifications.TokenProvider
): Promise<boolean> {
  // Verificar se o cliente foi iniciado antes de tentar autenticar
  if (!beamsClient) {
    console.warn('Pusher Beams: Cliente não foi iniciado. Não é possível autenticar usuário.')
    return false
  }

  try {
    await beamsClient.setUserId(userId, tokenProvider)
    console.log(`Pusher Beams: Usuário ${userId} autenticado`)
    return true
  } catch (error: any) {
    // Se o erro for relacionado a start não ter sido chamado, apenas logar warning
    if (error?.message?.includes('.start must be called before')) {
      console.warn('Pusher Beams: Cliente não foi iniciado corretamente')
      return false
    }
    
    console.warn('Pusher Beams: Erro ao autenticar usuário', error?.message || error)
    return false
  }
}

/**
 * Limpa o estado do Pusher Beams (usado no logout)
 * Não lança erros para não interromper o fluxo de logout
 */
export async function clearPusherBeamsState(): Promise<void> {
  // Se não há cliente inicializado, não há nada para limpar
  if (!beamsClient) {
    return
  }

  try {
    await beamsClient.clearAllState()
    console.log('Pusher Beams: Estado limpo')
  } catch (error: any) {
    // Se o erro for relacionado a push notifications não suportadas, apenas logar warning
    if (error?.message?.includes('Push service endpoint not supported') || 
        error?.message?.includes('unsupported browser')) {
      console.warn('Pusher Beams: Push notifications não são suportadas. Estado já estava limpo.')
      return
    }
    
    // Não lançar erro para não interromper o fluxo de logout
    console.warn('Pusher Beams: Erro ao limpar estado (não crítico)', error?.message || error)
  } finally {
    // Resetar o cliente após limpar
    beamsClient = null
  }
}

/**
 * Para o Pusher Beams completamente
 * Não lança erros para não interromper o fluxo
 */
export async function stopPusherBeams(): Promise<void> {
  if (!beamsClient) {
    return
  }

  try {
    await beamsClient.stop()
    beamsClient = null
    console.log('Pusher Beams: Parado')
  } catch (error: any) {
    // Não lançar erro para não interromper o fluxo
    console.warn('Pusher Beams: Erro ao parar (não crítico)', error?.message || error)
    beamsClient = null
  }
}

/**
 * Cria um TokenProvider para autenticação segura
 */
export function createTokenProvider(
  authEndpoint: string,
  userId: string
): PusherPushNotifications.TokenProvider {
  return new PusherPushNotifications.TokenProvider({
    url: authEndpoint,
    queryParams: { userId },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    credentials: 'include',
  })
}

/**
 * Obtém o Service Worker Registration atual
 */
export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return serviceWorkerRegistration
}

export { beamsClient, serviceWorkerRegistration }

