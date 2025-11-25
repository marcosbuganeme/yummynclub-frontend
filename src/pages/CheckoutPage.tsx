import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '../lib/stripe'
import { CheckoutForm } from '../components/CheckoutForm'
import { usePlans } from '../hooks/usePlans'
import { Loading } from '../components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { AlertCircle, ArrowLeft, Check } from 'lucide-react'
import { Button } from '../components/ui/button'
import api from '../services/api'

interface SetupIntentResponse {
  client_secret: string
  plan: {
    id: number
    name: string
    amount: number
    currency: string
    stripe_price_id: string
  }
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const planId = searchParams.get('planId')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [setupIntentError, setSetupIntentError] = useState<string | null>(null)
  const [isLoadingSetupIntent, setIsLoadingSetupIntent] = useState(false)

  const { data: plansData, isLoading: isLoadingPlans } = usePlans()
  const plans = plansData?.data || []
  const plan = plans.find((p) => p.id === Number(planId))

  useEffect(() => {
    const createSetupIntent = async () => {
      if (!planId || !plan) return

      setIsLoadingSetupIntent(true)
      setSetupIntentError(null)

      try {
        const response = await api.post<SetupIntentResponse>('/subscriptions/setup-intent', {
          plan_id: Number(planId),
        })
        setClientSecret(response.data.client_secret)
      } catch (error: any) {
        setSetupIntentError(
          error?.response?.data?.error || error?.response?.data?.message || 'Erro ao inicializar checkout'
        )
      } finally {
        setIsLoadingSetupIntent(false)
      }
    }

    if (plan) {
      createSetupIntent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, plan])

  if (isLoadingPlans || isLoadingSetupIntent) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loading size="lg" />
      </div>
    )
  }

  if (!planId || !plan) {
    return (
      <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4 text-lg">Plano não encontrado.</p>
              <Button onClick={() => navigate('/plans')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para planos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (setupIntentError) {
    return (
      <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao inicializar checkout</AlertTitle>
              <AlertDescription>{setupIntentError}</AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => navigate('/plans')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para planos
              </Button>
              <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loading size="lg" />
      </div>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button onClick={() => navigate('/plans')} variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para planos
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Resumo do Plano */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Resumo da Assinatura</CardTitle>
            <CardDescription>Revise os detalhes antes de finalizar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Plano</span>
                <span className="font-semibold">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor</span>
                <span className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: plan.currency || 'BRL',
                  }).format(plan.amount)}
                </span>
              </div>
              {plan.interval && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cobrança</span>
                  <span className="text-sm text-gray-700">
                    {plan.interval === 'month' ? 'Mensal' : plan.interval === 'year' ? 'Anual' : plan.interval}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Acesso completo à plataforma</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Suporte prioritário</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Cancelamento a qualquer momento</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Pagamento</CardTitle>
            <CardDescription>Complete seu pagamento de forma segura</CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={options} key={clientSecret}>
              <CheckoutForm planId={plan.id} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
