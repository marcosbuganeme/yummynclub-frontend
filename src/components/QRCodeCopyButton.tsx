import { useState } from 'react'
import { Copy, Check, QrCode, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useToast } from '../hooks/useToast'
import { cn } from '../lib/utils'

interface QRCodeCopyButtonProps {
  qrCode: string
  partnerName?: string
  className?: string
  showQRImage?: boolean
}

export function QRCodeCopyButton({
  qrCode,
  partnerName,
  className,
  showQRImage = true,
}: QRCodeCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Gerar URL do QR Code usando API externa
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode)
      setCopied(true)
      toast({
        variant: 'success',
        title: 'Copiado!',
        description: 'QR Code copiado para a área de transferência',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível copiar o QR Code',
      })
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `qr-code-${partnerName || 'partner'}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      variant: 'success',
      title: 'Download iniciado',
      description: 'QR Code baixado com sucesso',
    })
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">QR Code</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className={cn(
                'transition-all duration-200',
                copied && 'bg-green-50 border-green-200 text-green-700'
              )}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>
        {partnerName && (
          <CardDescription>QR Code de {partnerName}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showQRImage && (
          <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-gray-200">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-full max-w-[300px] h-auto"
            />
          </div>
        )}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Código QR:
          </p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-sm font-mono break-all flex-1 text-foreground">
              {qrCode}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Use este código para validações QR Code no seu estabelecimento
        </p>
      </CardContent>
    </Card>
  )
}

