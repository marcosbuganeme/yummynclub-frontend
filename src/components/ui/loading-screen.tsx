import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  message?: string
  className?: string
}

export function LoadingScreen({ message = 'Carregando...', className }: LoadingScreenProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center bg-background', className)}>
      <div className="flex flex-col items-center gap-6">
        {/* Spinner animado com múltiplas camadas */}
        <div className="relative h-16 w-16">
          {/* Círculo externo pulsante */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
          
          {/* Spinner principal */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          
          {/* Pontos decorativos orbitando */}
          {[...Array(3)].map((_, i) => {
            const angle = (i * 120 * Math.PI) / 180
            const radius = 30
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-primary"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  animation: `orbit-${i} 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            )
          })}
        </div>

        {/* Texto com animação */}
        <div className="text-center animate-in fade-in duration-500">
          <p className="text-lg font-medium text-foreground">{message}</p>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Estilos CSS para animação de órbita */}
      <style>{`
        @keyframes orbit-0 {
          0%, 100% {
            transform: translate(calc(-50% + ${Math.cos(0) * 30}px), calc(-50% + ${Math.sin(0) * 30}px));
            opacity: 0.3;
          }
          50% {
            transform: translate(calc(-50% + ${Math.cos(Math.PI) * 30}px), calc(-50% + ${Math.sin(Math.PI) * 30}px));
            opacity: 1;
          }
        }
        @keyframes orbit-1 {
          0%, 100% {
            transform: translate(calc(-50% + ${Math.cos((120 * Math.PI) / 180) * 30}px), calc(-50% + ${Math.sin((120 * Math.PI) / 180) * 30}px));
            opacity: 0.3;
          }
          50% {
            transform: translate(calc(-50% + ${Math.cos((120 * Math.PI) / 180 + Math.PI) * 30}px), calc(-50% + ${Math.sin((120 * Math.PI) / 180 + Math.PI) * 30}px));
            opacity: 1;
          }
        }
        @keyframes orbit-2 {
          0%, 100% {
            transform: translate(calc(-50% + ${Math.cos((240 * Math.PI) / 180) * 30}px), calc(-50% + ${Math.sin((240 * Math.PI) / 180) * 30}px));
            opacity: 0.3;
          }
          50% {
            transform: translate(calc(-50% + ${Math.cos((240 * Math.PI) / 180 + Math.PI) * 30}px), calc(-50% + ${Math.sin((240 * Math.PI) / 180 + Math.PI) * 30}px));
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

