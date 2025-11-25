import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Assinatura Criada com Sucesso!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Sua assinatura foi criada e processada com sucesso. Você já pode aproveitar todos os benefícios do seu plano.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/subscriptions')}>
              Ver Minhas Assinaturas
            </Button>
            <Button variant="outline" onClick={() => navigate('/partners')}>
              Ver Parceiros
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

