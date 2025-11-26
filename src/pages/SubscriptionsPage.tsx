import { useNavigate } from 'react-router-dom'
import { useSubscriptions, useCancelSubscription, useResumeSubscription } from '../hooks/useSubscriptions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Loading } from '../components/ui/loading'
import { useToast } from '../hooks/useToast'
import { useState } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard, 
  Calendar, 
  Tag,
  Copy,
  ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip'

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
      return {
        variant: 'default' as const,
        className: 'bg-green-500 hover:bg-green-600 text-white',
        icon: CheckCircle2,
        label: 'Ativa'
      }
    }
    if (status === 'canceled' || (endsAt && new Date(endsAt) <= new Date())) {
      return {
        variant: 'destructive' as const,
        className: 'bg-red-500 hover:bg-red-600 text-white',
        icon: XCircle,
        label: status === 'canceled' ? 'Cancelada' : 'Expirada'
      }
    }
    return {
      variant: 'secondary' as const,
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      icon: Clock,
      label: 'Inativa'
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      variant: 'success',
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
    })
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {subscriptions.map((subscription, index) => {
                    const statusInfo = getStatusBadge(subscription.stripe_status, subscription.ends_at)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <motion.div
                        key={subscription.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow duration-300">
                          {/* Gradient accent bar */}
                          <div className={`absolute top-0 left-0 right-0 h-1 ${
                            isActive(subscription) 
                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                              : subscription.stripe_status === 'canceled'
                              ? 'bg-gradient-to-r from-red-400 to-red-600'
                              : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                          }`} />
                          
                          <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <CardTitle className="text-xl mb-1">
                                  Assinatura #{subscription.id}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-2">
                                  <Tag className="h-3 w-3 flex-shrink-0" />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="font-mono text-xs truncate max-w-[180px]">
                                          {subscription.stripe_id || 'N/A'}
                                        </span>
                                      </TooltipTrigger>
                                      {subscription.stripe_id && subscription.stripe_id.length > 25 && (
                                        <TooltipContent>
                                          <p className="font-mono text-xs">{subscription.stripe_id}</p>
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>
                                  {subscription.stripe_id && (
                                    <button
                                      onClick={() => copyToClipboard(subscription.stripe_id, 'Stripe ID')}
                                      className="opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded flex-shrink-0"
                                      title="Copiar Stripe ID"
                                    >
                                      <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                  )}
                                </CardDescription>
                              </div>
                              <Badge className={statusInfo.className}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Informações principais */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CreditCard className="h-3 w-3" />
                                  <span>Preço</span>
                                </div>
                                <div className="flex items-center gap-2 group">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <p className="text-sm font-semibold font-mono truncate max-w-[120px]">
                                          {subscription.stripe_price && subscription.stripe_price.length > 15
                                            ? `${subscription.stripe_price.substring(0, 15)}...`
                                            : subscription.stripe_price || 'N/A'}
                                        </p>
                                      </TooltipTrigger>
                                      {subscription.stripe_price && subscription.stripe_price.length > 15 && (
                                        <TooltipContent>
                                          <p className="font-mono text-xs">{subscription.stripe_price}</p>
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>
                                  {subscription.stripe_price && (
                                    <button
                                      onClick={() => copyToClipboard(subscription.stripe_price, 'Preço')}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                                      title="Copiar preço"
                                    >
                                      <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>Criada em</span>
                                </div>
                                <p className="text-sm font-medium">
                                  {formatDate(subscription.created_at)}
                                </p>
                              </div>
                            </div>

                            {/* Informações secundárias */}
                            <div className="space-y-3 pt-3 border-t">
                              {subscription.trial_ends_at && (
                                <div className="flex items-center justify-between text-sm py-1">
                                  <span className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Trial até
                                  </span>
                                  <span className="font-medium">
                                    {formatDate(subscription.trial_ends_at)}
                                  </span>
                                </div>
                              )}
                              
                              {subscription.ends_at && (
                                <div className="flex items-center justify-between text-sm py-1">
                                  <span className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Termina em
                                  </span>
                                  <span className="font-medium">
                                    {formatDate(subscription.ends_at)}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-sm py-1">
                                <span className="text-muted-foreground flex items-center gap-2">
                                  <Tag className="h-4 w-4" />
                                  Status Stripe
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {subscription.stripe_status}
                                </Badge>
                              </div>
                            </div>

                            {/* Ações */}
                            <div className="pt-4 border-t">
                              {isActive(subscription) ? (
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                  onClick={() => handleCancel(subscription.id.toString())}
                                  disabled={cancellingId === subscription.id.toString()}
                                >
                                  {cancellingId === subscription.id.toString() ? (
                                    <>
                                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                                      Cancelando...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancelar Assinatura
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleResume(subscription.id.toString())}
                                  disabled={resumingId === subscription.id.toString()}
                                >
                                  {resumingId === subscription.id.toString() ? (
                                    <>
                                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                                      Renovando...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Renovar Assinatura
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
  )
}

