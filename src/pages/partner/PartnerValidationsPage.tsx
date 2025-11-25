import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export default function PartnerValidationsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Validações Recebidas</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Validações</CardTitle>
          <CardDescription>Lista de todas as validações realizadas no seu estabelecimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma validação encontrada.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

