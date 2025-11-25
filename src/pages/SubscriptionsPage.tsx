import { useNavigate } from 'react-router-dom'
import { useSubscriptions, useCancelSubscription, useResumeSubscription } from '../hooks/useSubscriptions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Loading } from '../components/ui/loading'
import { useToast } from '../hooks/useToast'
import { useState } from 'react'

export default function SubscriptionsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [resumingId, setResumingId] = useState<string | null>(null)

  const { data, isLoading, error } = useSubscriptions()
  const subscriptions = data?.data || []

  const cancelSubscription = useCancelSubscription()
  const resumeSubscription = useResumeSubscription()

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) {
      return
    }

    setCancellingId(id)
    try {
      await cancelSubscription.mutateAsync(id)
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Assinatura cancelada com sucesso.',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao cancelar assinatura. Tente novamente.',
      })
    } finally {
      setCancellingId(null)
    }
  }

  const handleResume = async (id: string) => {
    setResumingId(id)
    try {
      await resumeSubscription.mutateAsync(id)
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Assinatura renovada com sucesso.',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.response?.data?.message || 'Erro ao renovar assinatura. Tente novamente.',
      })
    } finally {
      setResumingId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string, endsAt: string | null) => {
    if (status === 'active' && (!endsAt || new Date(endsAt) > new Date())) {
      return 'bg-green-100 text-green-800'
    }
    if (status === 'canceled' || (endsAt && new Date(endsAt) <= new Date())) {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-yellow-100 text-yellow-800'
  }

  const isActive = (subscription: any) => {
    return subscription.stripe_status === 'active' && 
           (!subscription.ends_at || new Date(subscription.ends_at) > new Date())
  }

  return (
    <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Minhas Assinaturas</h2>

          {isLoading && (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              Erro ao carregar assinaturas. Tente novamente.
            </div>
          )}

          {!isLoading && !error && (
            <>
              {subscriptions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Você não possui assinaturas ativas.</p>
                      <Button onClick={() => navigate('/plans')}>
                        Ver planos disponíveis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <Card key={subscription.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Assinatura #{subscription.id}</CardTitle>
                            <CardDescription>
                              Stripe ID: {subscription.stripe_id}
                            </CardDescription>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              subscription.stripe_status,
                              subscription.ends_at
                            )}`}
                          >
                            {isActive(subscription) ? 'Ativa' : 
                             subscription.stripe_status === 'canceled' ? 'Cancelada' : 'Inativa'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm">
                            <span className="font-semibold">Status:</span>{' '}
                            {subscription.stripe_status}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Preço:</span>{' '}
                            {subscription.stripe_price}
                          </p>
                          {subscription.trial_ends_at && (
                            <p className="text-sm">
                              <span className="font-semibold">Trial até:</span>{' '}
                              {formatDate(subscription.trial_ends_at)}
                            </p>
                          )}
                          {subscription.ends_at && (
                            <p className="text-sm">
                              <span className="font-semibold">Termina em:</span>{' '}
                              {formatDate(subscription.ends_at)}
                            </p>
                          )}
                          <p className="text-sm">
                            <span className="font-semibold">Criada em:</span>{' '}
                            {formatDate(subscription.created_at)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {isActive(subscription) ? (
                            <Button
                              variant="destructive"
                              onClick={() => handleCancel(subscription.id.toString())}
                              disabled={cancellingId === subscription.id.toString()}
                            >
                              {cancellingId === subscription.id.toString() ? 'Cancelando...' : 'Cancelar'}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => handleResume(subscription.id.toString())}
                              disabled={resumingId === subscription.id.toString()}
                            >
                              {resumingId === subscription.id.toString() ? 'Renovando...' : 'Renovar'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
  )
}

