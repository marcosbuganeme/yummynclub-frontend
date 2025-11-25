import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { MapPin, Navigation, Loader2 } from 'lucide-react'

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places']

// Tipos para PlaceAutocompleteElement (web component)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          placeholder?: string
          'component-restrictions'?: string
        },
        HTMLElement
      >
    }
  }
}

interface PlaceSelectEvent extends Event {
  placePrediction: {
    toPlace(): Promise<google.maps.places.Place>
  }
}

interface AddressData {
  street: string
  street_number: string
  neighborhood: string
  city: string
  state: string
  postal_code: string
  complement: string
  reference_points: string
  formatted_address: string
  place_id: string | null
  address_components: any
  latitude: number
  longitude: number
}

interface AddressSelectorProps {
  value?: Partial<AddressData>
  onChange: (address: AddressData) => void
  apiKey: string
  defaultCenter?: { lat: number; lng: number }
  defaultZoom?: number
}

const defaultCenter = { lat: -23.5505, lng: -46.6333 } // São Paulo
const defaultZoom = 13


export function AddressSelector({
  value,
  onChange,
  apiKey,
  defaultCenter: center = defaultCenter,
  defaultZoom: zoom = defaultZoom,
}: AddressSelectorProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  })

  const [mapLoaded, setMapLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(center)
  const [addressData, setAddressData] = useState<AddressData>({
    street: '',
    street_number: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    complement: '',
    reference_points: '',
    formatted_address: '',
    place_id: null,
    address_components: null,
    latitude: center.lat,
    longitude: center.lng,
  })

  const placeAutocompleteRef = useRef<HTMLElement | null>(null)

  // Inicializar com valores existentes
  useEffect(() => {
    if (value) {
      const newAddressData = {
        street: value.street || '',
        street_number: value.street_number || '',
        neighborhood: value.neighborhood || '',
        city: value.city || '',
        state: value.state || '',
        postal_code: value.postal_code || '',
        complement: value.complement || '',
        reference_points: value.reference_points || '',
        formatted_address: value.formatted_address || '',
        place_id: value.place_id || null,
        address_components: value.address_components || null,
        latitude: value.latitude || center.lat,
        longitude: value.longitude || center.lng,
      }
      setAddressData(newAddressData)
      setMarkerPosition({ lat: newAddressData.latitude, lng: newAddressData.longitude })
    }
  }, [value])

  // Inicializar PlaceAutocompleteElement quando a API estiver carregada
  useEffect(() => {
    if (!isLoaded || placeAutocompleteRef.current) return

    const initPlaceAutocomplete = async () => {
      try {
        // Importar a biblioteca places se necessário
        if (window.google?.maps?.importLibrary) {
          await window.google.maps.importLibrary('places')
        }

        // Verificar se PlaceAutocompleteElement está disponível
        const PlacesLibrary = window.google?.maps?.places
        if (!PlacesLibrary || !PlacesLibrary.PlaceAutocompleteElement) {
          console.error('PlaceAutocompleteElement não está disponível')
          return
        }

        // Criar o elemento PlaceAutocompleteElement
        const PlaceAutocompleteElementClass = PlacesLibrary.PlaceAutocompleteElement as new (
          options?: google.maps.places.PlaceAutocompleteElementOptions
        ) => HTMLElement

        const placeAutocompleteEl = new PlaceAutocompleteElementClass({
          componentRestrictions: { country: 'br' },
        } as google.maps.places.PlaceAutocompleteElementOptions)

        // Estilizar o elemento
        placeAutocompleteEl.style.width = '100%'
        placeAutocompleteEl.style.height = '40px'
        placeAutocompleteEl.style.padding = '8px 12px'
        placeAutocompleteEl.style.border = '1px solid hsl(var(--input))'
        placeAutocompleteEl.style.borderRadius = 'calc(var(--radius) - 2px)'
        placeAutocompleteEl.style.backgroundColor = 'hsl(var(--background))'
        placeAutocompleteEl.style.fontSize = '14px'
        placeAutocompleteEl.style.color = 'hsl(var(--foreground))'
        placeAutocompleteEl.setAttribute('placeholder', 'Digite o endereço...')

        // Adicionar ao DOM
        const container = document.getElementById('place-autocomplete-container')
        if (container) {
          container.appendChild(placeAutocompleteEl)
          placeAutocompleteRef.current = placeAutocompleteEl

          // Adicionar listener para capturar seleção
          placeAutocompleteEl.addEventListener('gmp-select', async (event: Event) => {
            try {
              setIsLoading(true)
              const placeSelectEvent = event as PlaceSelectEvent
              
              // Converter placePrediction para Place
              const place = await placeSelectEvent.placePrediction.toPlace()
              
              // Buscar campos necessários
              await place.fetchFields({
                fields: ['displayName', 'formattedAddress', 'location', 'addressComponents', 'id'],
              })

              if (!place.location) {
                setIsLoading(false)
                return
              }

              const lat = place.location.lat()
              const lng = place.location.lng()

              setMarkerPosition({ lat, lng })
              if (map) {
                map.setCenter({ lat, lng })
                map.setZoom(16)
              }

              // Processar componentes de endereço
              const addressComponents: any = {}
              const addressComponentsArray: any[] = []

              // Processar addressComponents
              if (place.addressComponents) {
                place.addressComponents.forEach((component: any) => {
                  const types = component.types || []
                  // PlaceAutocompleteElement usa longText/shortText
                  const longText = component.longText || ''
                  const shortText = component.shortText || ''

                  addressComponentsArray.push({
                    long_name: longText,
                    short_name: shortText,
                    types: types,
                  })

                  if (types.includes('street_number')) {
                    addressComponents.street_number = longText
                  }
                  if (types.includes('route')) {
                    addressComponents.street = longText
                  }
                  if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                    addressComponents.neighborhood = longText
                  }
                  if (types.includes('administrative_area_level_2')) {
                    addressComponents.city = longText
                  }
                  if (types.includes('administrative_area_level_1')) {
                    addressComponents.state = shortText
                  }
                  if (types.includes('postal_code')) {
                    addressComponents.postal_code = longText
                  }
                })
              }

              const newAddressData: AddressData = {
                street: addressComponents.street || '',
                street_number: addressComponents.street_number || '',
                neighborhood: addressComponents.neighborhood || '',
                city: addressComponents.city || '',
                state: addressComponents.state || '',
                postal_code: addressComponents.postal_code || '',
                complement: addressData.complement,
                reference_points: addressData.reference_points,
                formatted_address: place.formattedAddress || place.displayName || '',
                place_id: place.id || null,
                address_components: addressComponentsArray.length > 0 ? addressComponentsArray : null,
                latitude: lat,
                longitude: lng,
              }

              setAddressData(newAddressData)
              onChange(newAddressData)
              setIsLoading(false)
            } catch (error) {
              console.error('Erro ao processar local selecionado:', error)
              setIsLoading(false)
            }
          })
        }
      } catch (error) {
        console.error('Erro ao inicializar PlaceAutocompleteElement:', error)
      }
    }

    initPlaceAutocomplete()

    // Cleanup
    return () => {
      if (placeAutocompleteRef.current) {
        try {
          placeAutocompleteRef.current.remove()
        } catch (e) {
          // Ignorar erros de cleanup
        }
        placeAutocompleteRef.current = null
      }
    }
  }, [isLoaded, map, addressData.complement, addressData.reference_points, onChange])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    setGeocoder(new google.maps.Geocoder())
    setMapLoaded(true)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
    setGeocoder(null)
  }, [])

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!geocoder || !map) return

      const lat = e.latLng?.lat() || center.lat
      const lng = e.latLng?.lng() || center.lng

      setIsLoading(true)
      setMarkerPosition({ lat, lng })

      // Reverse geocoding
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const result = results[0]
          const addressComponents: any = {}

          result.address_components.forEach((component) => {
            const types = component.types
            if (types.includes('street_number')) {
              addressComponents.street_number = component.long_name
            }
            if (types.includes('route')) {
              addressComponents.street = component.long_name
            }
            if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
              addressComponents.neighborhood = component.long_name
            }
            if (types.includes('administrative_area_level_2')) {
              addressComponents.city = component.long_name
            }
            if (types.includes('administrative_area_level_1')) {
              addressComponents.state = component.short_name
            }
            if (types.includes('postal_code')) {
              addressComponents.postal_code = component.long_name
            }
          })

          const newAddressData: AddressData = {
            street: addressComponents.street || '',
            street_number: addressComponents.street_number || '',
            neighborhood: addressComponents.neighborhood || '',
            city: addressComponents.city || '',
            state: addressComponents.state || '',
            postal_code: addressComponents.postal_code || '',
            complement: addressData.complement,
            reference_points: addressData.reference_points,
            formatted_address: result.formatted_address || '',
            place_id: result.place_id || null,
            address_components: result.address_components || null,
            latitude: lat,
            longitude: lng,
          }

          setAddressData(newAddressData)
          onChange(newAddressData)
        }
        setIsLoading(false)
      })
    },
    [geocoder, map, addressData.complement, addressData.reference_points, onChange]
  )

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation || !map || !geocoder) return

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setMarkerPosition({ lat, lng })
        map.setCenter({ lat, lng })
        map.setZoom(16)

        // Reverse geocoding
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0]
            const addressComponents: any = {}

            result.address_components.forEach((component) => {
              const types = component.types
              if (types.includes('street_number')) {
                addressComponents.street_number = component.long_name
              }
              if (types.includes('route')) {
                addressComponents.street = component.long_name
              }
              if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                addressComponents.neighborhood = component.long_name
              }
              if (types.includes('administrative_area_level_2')) {
                addressComponents.city = component.long_name
              }
              if (types.includes('administrative_area_level_1')) {
                addressComponents.state = component.short_name
              }
              if (types.includes('postal_code')) {
                addressComponents.postal_code = component.long_name
              }
            })

            const newAddressData: AddressData = {
              street: addressComponents.street || '',
              street_number: addressComponents.street_number || '',
              neighborhood: addressComponents.neighborhood || '',
              city: addressComponents.city || '',
              state: addressComponents.state || '',
              postal_code: addressComponents.postal_code || '',
              complement: addressData.complement,
              reference_points: addressData.reference_points,
              formatted_address: result.formatted_address || '',
              place_id: result.place_id || null,
              address_components: result.address_components || null,
              latitude: lat,
              longitude: lng,
            }

            setAddressData(newAddressData)
            onChange(newAddressData)
          }
          setIsLoading(false)
        })
      },
      () => {
        setIsLoading(false)
        alert('Não foi possível obter sua localização')
      }
    )
  }, [map, geocoder, addressData.complement, addressData.reference_points, onChange])

  const handleFieldChange = useCallback(
    (field: keyof AddressData, newValue: string) => {
      const updatedData = { ...addressData, [field]: newValue }
      setAddressData(updatedData)
      onChange(updatedData)
    },
    [addressData, onChange]
  )

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px',
  }

  // Mostrar skeleton enquanto carrega
  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Seleção de Endereço
            </CardTitle>
            <CardDescription>
              Digite um endereço ou clique no mapa para selecionar a localização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address-autocomplete">Buscar Endereço</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadError) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-red-600">
            <p className="font-semibold">Erro ao carregar Google Maps</p>
            <p className="text-sm text-muted-foreground mt-1">
              Verifique sua conexão com a internet e tente novamente.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seleção de Endereço
          </CardTitle>
          <CardDescription>
            Digite um endereço ou clique no mapa para selecionar a localização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* PlaceAutocompleteElement - Nova API do Google Maps */}
          <div className="space-y-2">
            <Label htmlFor="address-autocomplete">Buscar Endereço</Label>
            <div className="relative">
              <div
                id="place-autocomplete-container"
                className="w-full"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Botão de localização atual */}
          <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={!mapLoaded || isLoading}
              className="w-full"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Usar Minha Localização
          </Button>

          {/* Mapa */}
          {!mapLoaded ? (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={markerPosition}
              zoom={zoom}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
              }}
            >
              <Marker position={markerPosition} />
            </GoogleMap>
          )}

          {/* Campos de endereço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Rua/Logradouro</Label>
                <Input
                  id="street"
                  value={addressData.street}
                  onChange={(e) => handleFieldChange('street', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street_number">Número</Label>
                <Input
                  id="street_number"
                  value={addressData.street_number}
                  onChange={(e) => handleFieldChange('street_number', e.target.value)}
                  placeholder="123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={addressData.neighborhood}
                  onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={addressData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  value={addressData.state}
                  onChange={(e) => handleFieldChange('state', e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">CEP</Label>
                <Input
                  id="postal_code"
                  value={addressData.postal_code}
                  onChange={(e) => handleFieldChange('postal_code', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={addressData.complement}
              onChange={(e) => handleFieldChange('complement', e.target.value)}
              placeholder="Apto, Bloco, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_points">Pontos de Referência</Label>
            <Textarea
              id="reference_points"
              value={addressData.reference_points}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('reference_points', e.target.value)}
              placeholder="Ex: Próximo ao shopping, em frente ao banco..."
              rows={3}
            />
          </div>

          {/* Endereço formatado */}
          {addressData.formatted_address && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Endereço Completo:</p>
              <p className="text-sm text-muted-foreground">{addressData.formatted_address}</p>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
  )
}
