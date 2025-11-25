import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircle, Camera, CameraOff, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void
  onError?: (error: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRCodeScanner({ onScanSuccess, onError, open, onOpenChange }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [cameraId, setCameraId] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerId = 'qr-reader'

  // Verificar permissões de câmera
  useEffect(() => {
    if (open) {
      checkCameraPermission()
    }
  }, [open])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setHasPermission(true)
      // Listar câmeras disponíveis
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      if (videoDevices.length > 0) {
        setCameraId(videoDevices[0].deviceId)
      }
      // Parar o stream imediatamente após verificar
      stream.getTracks().forEach(track => track.stop())
    } catch (err: any) {
      setHasPermission(false)
      setError('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.')
    }
  }

  useEffect(() => {
    if (open && hasPermission === true && !scannerRef.current) {
      startScanning()
    } else if (!open && scannerRef.current) {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [open, hasPermission])

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const html5QrCode = new Html5Qrcode(scannerId)
      scannerRef.current = html5QrCode

      // Configurações melhoradas para diferentes dispositivos
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: cameraId
          ? { deviceId: { exact: cameraId } }
          : { facingMode: 'environment' },
      }

      await html5QrCode.start(
        cameraId || { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Sucesso ao escanear
          onScanSuccess(decodedText)
          stopScanning()
          onOpenChange(false)
        },
        (errorMessage) => {
          // Ignorar erros de leitura contínua (normal durante escaneamento)
          // Apenas logar se for um erro crítico
          if (!errorMessage.includes('NotFoundException') && 
              !errorMessage.includes('No MultiFormat Readers')) {
            console.debug('Scanner:', errorMessage)
          }
        }
      )
      
      setIsScanning(false)
    } catch (err: any) {
      let errorMessage = 'Erro ao iniciar scanner'
      
      if (err.message?.includes('Permission denied') || err.message?.includes('NotAllowedError')) {
        errorMessage = 'Permissão de câmera negada. Por favor, permita o acesso à câmera.'
        setHasPermission(false)
      } else if (err.message?.includes('NotFoundError') || err.message?.includes('DevicesNotFoundError')) {
        errorMessage = 'Nenhuma câmera encontrada. Verifique se há uma câmera conectada.'
      } else if (err.message?.includes('NotReadableError')) {
        errorMessage = 'Câmera já está em uso por outro aplicativo.'
      } else {
        errorMessage = err.message || 'Erro ao iniciar scanner'
      }
      
      setError(errorMessage)
      setIsScanning(false)
      if (onError) {
        onError(errorMessage)
      }
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch (err) {
        // Ignorar erros ao parar
        console.debug('Erro ao parar scanner:', err)
      }
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleClose = () => {
    stopScanning()
    setError(null)
    setHasPermission(null)
    onOpenChange(false)
  }

  const handleRetry = () => {
    setError(null)
    setHasPermission(null)
    checkCameraPermission()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escanear QR Code
          </DialogTitle>
          <DialogDescription>
            Posicione o QR Code dentro da área de leitura
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao iniciar scanner</AlertTitle>
              <AlertDescription className="mt-2">
                {error}
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {hasPermission === false && !error && (
            <Alert>
              <CameraOff className="h-4 w-4" />
              <AlertTitle>Permissão necessária</AlertTitle>
              <AlertDescription>
                Por favor, permita o acesso à câmera para escanear QR Codes.
              </AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <div
              id={scannerId}
              className={cn(
                'w-full rounded-lg overflow-hidden bg-black',
                'min-h-[300px] flex items-center justify-center',
                (isScanning || hasPermission === null) && 'opacity-50'
              )}
            />
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">Iniciando câmera...</p>
                </div>
              </div>
            )}
            {!isScanning && hasPermission === true && !error && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-blue-500 rounded-lg w-[250px] h-[250px] shadow-lg" />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            {error && (
              <Button onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
