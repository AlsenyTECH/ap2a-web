import { useQuery } from '@tanstack/react-query'
import { annuaireApi } from '@/lib/api/annuaire'
import type { FonctionAssociation } from '@/lib/api/types'

export function useAnnuaire(filtres?: { fonction?: FonctionAssociation; q?: string }) {
  return useQuery({
    queryKey: ['annuaire', filtres?.fonction ?? null, filtres?.q ?? ''],
    queryFn: () => annuaireApi.liste(filtres),
  })
}
