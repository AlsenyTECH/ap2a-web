import { apiClient } from './client'
import type { DestinataireKit, Kit, LigneDistributionKit, TypeCibleKit } from './types'

export interface KitPayload {
  nom: string
  contenu: string
  type_cible: TypeCibleKit
  id_formation?: number
  id_cohorte?: number
  participants_ids?: number[]
}

export const kitsApi = {
  liste: (filtres?: { idFormation?: number; idCohorte?: number }) =>
    apiClient
      .get<Kit[]>('/kits/', {
        params: {
          formation: filtres?.idFormation,
          cohorte: filtres?.idCohorte,
        },
      })
      .then((r) => r.data),

  detail: (idKit: number) => apiClient.get<Kit>(`/admin/kit/${idKit}/`).then((r) => r.data),

  creer: (payload: KitPayload) => apiClient.post<Kit>('/admin/kit/', payload).then((r) => r.data),

  modifier: (idKit: number, payload: Partial<KitPayload>) =>
    apiClient.patch<Kit>(`/admin/kit/${idKit}/`, payload).then((r) => r.data),

  supprimer: (idKit: number): Promise<void> => apiClient.delete(`/admin/kit/${idKit}/`).then(() => undefined),

  distributionCohorte: (idCohorte: number) =>
    apiClient.get<LigneDistributionKit[]>(`/admin/cohorte/${idCohorte}/distribution/`).then((r) => r.data),

  distributionKit: (idKit: number) =>
    apiClient.get<DestinataireKit[]>(`/admin/kit/${idKit}/distribution/`).then((r) => r.data),

  basculerDistribution: (idKit: number, idParticipant: number) =>
    apiClient
      .post<{ id_kit: number; id_participant: number; distribue: boolean; date_distribution: string | null; remis_par: string | null }>(
        `/admin/kit/${idKit}/participant/${idParticipant}/distribuer/`,
      )
      .then((r) => r.data),
}
