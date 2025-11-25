import { lazy, Suspense } from 'react'
import { Skeleton } from './ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

const AddressSelector = lazy(() => 
  import('./AddressSelector').then(module => ({ 
    default: module.AddressSelector 
  }))
)

interface AddressSelectorLazyProps {
  value?: any
  onChange: (address: any) => void
  apiKey?: string
  defaultCenter?: { lat: number; lng: number }
  defaultZoom?: number
}

export function AddressSelectorLazy(props: AddressSelectorLazyProps) {
  if (!props.apiKey) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Configure VITE_GOOGLE_MAPS_API_KEY no .env para usar o seletor de endereço com Google Maps
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader>
            <CardTitle>Seleção de Endereço</CardTitle>
            <CardDescription>Carregando mapa...</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full rounded-lg mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      }
    >
      <AddressSelector {...props} apiKey={props.apiKey} />
    </Suspense>
  )
}

