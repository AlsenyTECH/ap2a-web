import { apiClient } from './client'
import type { Controleur, HistoriqueScanControleur } from './types'

export const controleursApi = {
  liste: () => apiClient.get<Controleur[]>('/admin/controleurs/').then((r) => r.data),

  modifier: (
    idControleur: number,
    payload: Partial<{ zone_affectation: string; nom: string; prenom: string; email: string }>,
  ) =>
    apiClient
      .patch<{ id_controleur: number; zone_affectation: string; nom: string; prenom: string; email: string }>(
        `/admin/controleur/${idControleur}/`,
        payload,
      )
      .then((r) => r.data),

  supprimer: (idControleur: number): Promise<void> =>
    apiClient.delete(`/admin/controleur/${idControleur}/supprimer/`).then(() => undefined),

  creer: (
    payload:
      | { email_membre: string; id_evenement?: number }
      | {
          email: string
          mot_de_passe: string
          nom: string
          prenom: string
          zone_affectation?: string
          id_evenement?: number
        },
  ) =>
    apiClient
      .post<{ id_controleur: number; email: string }>('/admin/creer-controleur/', payload)
      .then((r) => r.data),

  assigner: (idControleur: number, idEvenement: number) =>
    apiClient
      .post<{
        id_controleur: number
        evenement_assigne: { id_evenement: number; titre: string }
      }>(`/admin/controleur/${idControleur}/assigner/`, { id_evenement: idEvenement })
      .then((r) => r.data),

  reinitialiserMotDePasse: (idControleur: number) =>
    apiClient
      .post<{ email: string; mot_de_passe_temporaire: string }>(
        `/admin/controleur/${idControleur}/reinitialiser-mot-de-passe/`,
      )
      .then((r) => r.data),

  monHistorique: () =>
    apiClient.get<HistoriqueScanControleur[]>('/controleur/historique/').then((r) => r.data),
}
