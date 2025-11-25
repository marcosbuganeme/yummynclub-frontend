import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import type { Plan } from '../types'

interface PlansResponse {
  data: Plan[]
}

export function usePlans() {
  return useQuery<PlansResponse>({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await api.get('/plans')
      return response.data
    },
  })
}

