import { apiClient } from './client'
import type { FonctionAssociation, MembreAnnuaire } from './types'

export const annuaireApi = {
  liste: (filtres?: { fonction?: FonctionAssociation; q?: string }) =>
    apiClient
      .get<MembreAnnuaire[]>('/annuaire/', {
        params: {
          fonction: filtres?.fonction || undefined,
          q: filtres?.q || undefined,
        },
      })
      .then((r) => r.data),
}
