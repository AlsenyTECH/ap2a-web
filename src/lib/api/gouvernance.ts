import { apiClient } from './client'
import type { CompteRendu } from './types'

export interface CompteRenduPayload {
  titre: string
  date_reunion: string
  contenu: string
  decisions?: string
}

export const gouvernanceApi = {
  liste: () => apiClient.get<CompteRendu[]>('/gouvernance/comptes-rendus/').then((r) => r.data),

  detail: (idCompteRendu: number) =>
    apiClient.get<CompteRendu>(`/gouvernance/comptes-rendus/${idCompteRendu}/`).then((r) => r.data),

  creer: (payload: CompteRenduPayload) =>
    apiClient.post<CompteRendu>('/gouvernance/comptes-rendus/', payload).then((r) => r.data),

  modifier: (idCompteRendu: number, payload: Partial<CompteRenduPayload>) =>
    apiClient.patch<CompteRendu>(`/gouvernance/comptes-rendus/${idCompteRendu}/`, payload).then((r) => r.data),

  supprimer: (idCompteRendu: number): Promise<void> =>
    apiClient.delete(`/gouvernance/comptes-rendus/${idCompteRendu}/`).then(() => undefined),
}
