import { apiClient, buildDownloadUrl } from './client'
import type { DashboardStats, JournalPage, ScanControleAcces, Statistiques } from './types'

export const dashboardApi = {
  statistiques: () => apiClient.get<Statistiques>('/admin/statistiques/').then((r) => r.data),

  rapportControleAcces: (params: { id_controleur?: number; date_debut?: string; date_fin?: string } = {}) =>
    apiClient
      .get<ScanControleAcces[]>('/admin/rapport-controle-acces/', {
        params: {
          id_controleur: params.id_controleur ?? undefined,
          date_debut: params.date_debut || undefined,
          date_fin: params.date_fin || undefined,
        },
      })
      .then((r) => r.data),

  journal: (
    params: { type_action?: string; date_debut?: string; date_fin?: string; page?: number } = {},
  ) =>
    apiClient
      .get<JournalPage>('/admin/journal/', {
        params: {
          type_action: params.type_action || undefined,
          date_debut: params.date_debut || undefined,
          date_fin: params.date_fin || undefined,
          page: params.page ?? undefined,
        },
      })
      .then((r) => r.data),

  stats: () => apiClient.get<DashboardStats>('/dashboard/stats/').then((r) => r.data),

  exportRapportUrl: (params: {
    type: 'statistiques' | 'evenement' | 'journal' | 'controle_acces'
    format: 'excel' | 'pdf'
    id_evenement?: string
    type_action?: string
    id_controleur?: string
    date_debut?: string
    date_fin?: string
  }) => {
    const extraParams: Record<string, string> = { type: params.type, format: params.format }
    if (params.id_evenement) extraParams.id_evenement = params.id_evenement
    if (params.type_action) extraParams.type_action = params.type_action
    if (params.id_controleur) extraParams.id_controleur = params.id_controleur
    if (params.date_debut) extraParams.date_debut = params.date_debut
    if (params.date_fin) extraParams.date_fin = params.date_fin
    return buildDownloadUrl('/admin/rapports/export/', extraParams)
  },
}
