import { useNavigate } from 'react-router-dom'
import { usePlans } from '../hooks/usePlans'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Loading } from '../components/ui/loading'

export default function PlansPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = usePlans()

  const plans = data?.data || []

  const formatPrice = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatInterval = (interval: string, intervalCount: number) => {
    if (interval === 'month') {
      return intervalCount === 1 ? 'mensal' : `a cada ${intervalCount} meses`
    }
    if (interval === 'year') {
      return intervalCount === 1 ? 'anual' : `a cada ${intervalCount} anos`
    }
    return interval
  }

  const handleSubscribe = (planId: number) => {
    navigate(`/checkout?planId=${planId}`)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Planos Disponíveis</h2>
        <p className="text-gray-600">Escolha o plano que melhor se adequa às suas necessidades</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Erro ao carregar planos. Tente novamente.
        </div>
      )}

      {/* Lista de planos */}
      {!isLoading && !error && (
        <>
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum plano disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.description || 'Plano de assinatura'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900">
                        {formatPrice(plan.amount, plan.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        / {formatInterval(plan.interval, plan.interval_count)}
                      </div>
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <span className="mr-2 text-green-500">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      Assinar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

