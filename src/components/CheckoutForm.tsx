import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from './ui/button'
import { useToast } from '../hooks/useToast'
import { useCreateSubscription } from '../hooks/useSubscriptions'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock, Shield, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'
import { TestCardMockup } from './TestCardMockup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface CheckoutFormProps {
  planId: number
}

export function CheckoutForm({ planId }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const createSubscription = useCreateSubscription()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Stripe ainda não está carregado. Aguarde um momento.',
      })
      return
    }

    setLoading(true)

    try {
      // Validar PaymentElement
      const { error: submitError } = await elements.submit()
      if (submitError) {
        toast({
          variant: 'destructive',
          title: 'Erro de validação',
          description: submitError.message,
        })
        setLoading(false)
        return
      }

      // Confirmar SetupIntent primeiro
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      })

      if (confirmError) {
        // Tratamento específico para erro de cartão real em modo de teste
        let errorMessage = confirmError.message || 'Não foi possível confirmar o método de pagamento.'
        
        if (confirmError.code === 'card_declined' && confirmError.decline_code === 'test_mode_live_card') {
          errorMessage = 'Você está usando um cartão real em modo de teste. Use um cartão de teste do Stripe. Veja os cartões válidos abaixo.'
        }
        
        toast({
          variant: 'destructive',
          title: 'Erro ao confirmar pagamento',
          description: errorMessage,
          duration: 8000, // Mostrar por mais tempo para erros importantes
        })
        setLoading(false)
        return
      }

      if (!setupIntent || !setupIntent.payment_method) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível obter o método de pagamento.',
        })
        setLoading(false)
        return
      }

      // Criar assinatura no backend usando o payment_method do SetupIntent
      await createSubscription.mutateAsync({
        plan_id: planId,
        payment_method_id: setupIntent.payment_method as string,
      })

      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Assinatura criada com sucesso!',
      })

      // Redirecionar para página de sucesso
      navigate('/subscription/success')
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Erro ao criar assinatura. Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Verificar se está em modo de teste (chave começa com pk_test_)
  const isTestMode = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Seus dados de pagamento são processados de forma segura pelo Stripe. Nós não armazenamos informações de cartão.
        </AlertDescription>
      </Alert>

      {isTestMode && (
        <>
          {/* Card Mockup para modo de teste */}
          <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-blue-600">Modo de Teste</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Use este cartão de teste
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Cartões reais não funcionarão em modo de teste
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <TestCardMockup
                cardNumber="4242 4242 4242 4242"
                expiryDate="12/34"
                cvv="123"
                variant="gradient"
              />
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between p-2 bg-white/50 rounded-md">
                  <span className="font-medium">Número do Cartão:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded">4242 4242 4242 4242</code>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 rounded-md">
                  <span className="font-medium">Data de Validade:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded">12/34</code>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 rounded-md">
                  <span className="font-medium">CVC:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded">123</code>
                </div>
                <a
                  href="https://stripe.com/docs/testing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline mt-3"
                >
                  Ver mais cartões de teste
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Informações do Cartão</label>
        <div className="border rounded-lg p-4 bg-white">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={!stripe || loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando pagamento...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Finalizar Assinatura
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Ao finalizar, você concorda com nossos termos de serviço e política de privacidade.
      </p>
    </form>
  )
}
