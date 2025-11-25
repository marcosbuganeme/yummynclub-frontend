import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePartners, usePartnerCategories } from '../hooks/usePartners'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Loading } from '../components/ui/loading'

export default function PartnersPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const navigate = useNavigate()

  const { data: categoriesData } = usePartnerCategories()
  const categories = categoriesData || []

  const { data, isLoading, error } = usePartners({
    search: search || undefined,
    category: selectedCategory || undefined,
  })

  const partners = data?.data || []

  return (
    <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Parceiros</h2>
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Buscar parceiros..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="sm:w-48">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              Erro ao carregar parceiros. Tente novamente.
            </div>
          )}

          {/* Lista de parceiros */}
          {!isLoading && !error && (
            <>
              {partners.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum parceiro encontrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners.map((partner) => (
                    <Card
                      key={partner.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/partners/${partner.id}`)}
                    >
                      <CardHeader>
                        <CardTitle>{partner.name}</CardTitle>
                        <CardDescription>{partner.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {partner.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {partner.description}
                          </p>
                        )}
                        {partner.address && (
                          <p className="text-xs text-gray-500">{partner.address}</p>
                        )}
                        <Button
                          className="w-full mt-4"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/partners/${partner.id}`)
                          }}
                        >
                          Ver detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
  )
}

