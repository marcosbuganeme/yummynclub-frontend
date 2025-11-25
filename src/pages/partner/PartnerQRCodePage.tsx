import { useEffect, useState } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { QRCodeCopyButton } from '../../components/QRCodeCopyButton'
import { LoadingPage } from '../../components/ui/loading'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

interface PartnerData {
  qr_code: string
  name: string
}

export default function PartnerQRCodePage() {
  const { user } = useAuth()
  const [partner, setPartner] = useState<PartnerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPartnerQRCode = async () => {
      try {
        setIsLoading(true)
        // Buscar dados do parceiro logado
        const response = await api.get('/partners/me')
        setPartner(response.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao carregar QR Code')
        console.error('Erro ao buscar QR Code:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchPartnerQRCode()
    }
  }, [user])

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
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Erro ao carregar QR Code</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!partner?.qr_code) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p className="font-semibold">QR Code não disponível</p>
              <p className="text-sm mt-1">Entre em contato com o suporte para gerar seu QR Code.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Meu QR Code</h2>
        <QRCodeCopyButton
          qrCode={partner.qr_code}
          partnerName={partner.name}
          showQRImage={true}
        />
      </div>
    </div>
  )
}
