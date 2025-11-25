import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { usePartner } from '../hooks/usePartners'
import { useCreateValidation } from '../hooks/useValidations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { LoadingPage } from '../components/ui/loading'
import { QRCodeScanner } from '../components/QRCodeScanner'
import { useToast } from '../hooks/useToast'

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [qrCode, setQrCode] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const { toast } = useToast()

  const partnerId = id ? Number(id) : null
  const { data, isLoading, error } = usePartner(partnerId || 0)
  const partner = data?.data

  const createValidation = useCreateValidation()

  const handleScanSuccess = (decodedText: string) => {
    setQrCode(decodedText)
    handleValidate(decodedText)
  }

  const handleValidate = async (code?: string) => {
    const codeToValidate = code || qrCode

    if (!codeToValidate.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, insira ou escaneie o código QR',
      })
      return
    }

    try {
      await createValidation.mutateAsync({
        validation_type: 'qr_code',
        qr_code: codeToValidate,
      })
      toast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Validação realizada com sucesso!',
      })
      setQrCode('')
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.response?.data?.error || 'Erro ao validar',
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleValidate()
  }

  // Verificar se o ID é válido
  if (!id || !partnerId || isNaN(partnerId)) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ID inválido</h2>
          <Button onClick={() => navigate('/partners')}>Voltar para parceiros</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <LoadingPage />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar parceiro</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
          <Button onClick={() => navigate('/partners')}>Voltar para parceiros</Button>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Parceiro não encontrado</h2>
          <Button onClick={() => navigate('/partners')}>Voltar para parceiros</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/partners')}>
          ← Voltar para Parceiros
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{partner.name}</CardTitle>
          <CardDescription>{partner.category}</CardDescription>
        </CardHeader>
        <CardContent>
          {partner.description && (
            <p className="text-gray-600 mb-4">{partner.description}</p>
          )}
          <div className="space-y-2">
            {partner.email && (
              <p className="text-sm">
                <span className="font-semibold">Email:</span> {partner.email}
              </p>
            )}
            {partner.phone && (
              <p className="text-sm">
                <span className="font-semibold">Telefone:</span> {partner.phone}
              </p>
            )}
            {partner.address && (
              <p className="text-sm">
                <span className="font-semibold">Endereço:</span> {partner.address}
              </p>
            )}
            {partner.latitude != null && partner.longitude != null && (
              <p className="text-sm text-gray-500">
                Localização: {Number(partner.latitude).toFixed(6)}, {Number(partner.longitude).toFixed(6)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validação */}
      <Card>
        <CardHeader>
          <CardTitle>Validar Benefício</CardTitle>
          <CardDescription>Escaneie ou digite o código QR do parceiro</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Código QR"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  disabled={createValidation.isPending}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScannerOpen(true)}
              >
                Escanear
              </Button>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={createValidation.isPending}
            >
              {createValidation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validar Benefício
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <QRCodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  )
}
