import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from './ui/button'
import { useToast } from '../hooks/useToast'
import { useCreateSubscription } from '../hooks/useSubscriptions'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock, Shield } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'

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
        toast({
          variant: 'destructive',
          title: 'Erro ao confirmar pagamento',
          description: confirmError.message || 'Não foi possível confirmar o método de pagamento.',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Seus dados de pagamento são processados de forma segura pelo Stripe. Nós não armazenamos informações de cartão.
        </AlertDescription>
      </Alert>

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
