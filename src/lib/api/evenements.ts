import { apiClient } from './client'
import type {
  Confirmation,
  EvenementDetail,
  EvenementListItem,
  EvenementMembre,
  ModeInscription,
  Seance,
  StatutConfirmation,
  TypeEvenement,
} from './types'

export const evenementsApi = {
  liste: () => apiClient.get<EvenementListItem[]>('/evenements/').then((r) => r.data),

  seances: (idEvenement: number) =>
    apiClient.get<Seance[]>(`/evenement/${idEvenement}/seances/`).then((r) => r.data),

  creer: (payload: {
    titre: string
    lieu: string
    type_evenement: TypeEvenement
    dates: string[]
    mode_inscription?: ModeInscription
    capacite_max?: number
    /** Requis si mode_inscription === 'RESTREINT'. */
    membres_cibles?: number[]
  }) =>
    apiClient
      .post<{ id_evenement: number; titre: string; nombre_seances: number }>('/admin/evenement/', payload)
      .then((r) => r.data),

  detail: (idEvenement: number) =>
    apiClient.get<EvenementDetail>(`/admin/evenement/${idEvenement}/`).then((r) => r.data),

  modifier: (
    idEvenement: number,
    payload: Partial<{
      titre: string
      lieu: string
      type_evenement: TypeEvenement
      description: string
      mode_inscription: ModeInscription
      capacite_max: number
      dates: string[]
      membres_cibles: number[]
    }>,
  ) =>
    apiClient
      .patch<{ id_evenement: number; titre: string; nombre_seances: number }>(
        `/admin/evenement/${idEvenement}/modifier/`,
        payload,
      )
      .then((r) => r.data),

  annuler: (idEvenement: number) =>
    apiClient
      .post<{ id_evenement: number; est_annule: boolean }>(`/admin/evenement/${idEvenement}/annuler/`)
      .then((r) => r.data),

  supprimer: (idEvenement: number): Promise<void> =>
    apiClient.delete(`/admin/evenement/${idEvenement}/modifier/`).then(() => undefined),

  terminer: (idEvenement: number) =>
    apiClient
      .post<{ id_evenement: number; est_termine: true }>(`/admin/evenement/${idEvenement}/terminer/`)
      .then((r) => r.data),

  historique: () =>
    apiClient
      .get<Array<EvenementListItem & { nombre_participants: number; est_termine: boolean }>>(
        '/admin/evenements/historique/',
      )
      .then((r) => r.data),

  confirmations: (idEvenement: number) =>
    apiClient
      .get<{
        evenement: string
        nb_confirmes: number
        nb_liste_attente: number
        capacite_max: number | null
        confirmations: Confirmation[]
      }>(`/admin/evenement/${idEvenement}/confirmations/`)
      .then((r) => r.data),

  ajouterInvite: (
    idEvenement: number,
    payload: { nom: string; prenom: string; telephone?: string; organisation?: string },
  ) =>
    apiClient
      .post<{ message: string; id_invite: number }>(`/admin/evenement/${idEvenement}/invite/`, payload)
      .then((r) => r.data),

  importerInvites: (idEvenement: number, fichier: File) => {
    const form = new FormData()
    form.append('fichier', fichier)
    return apiClient
      .post<{ message: string; crees: number; erreurs: string[] }>(
        `/admin/evenement/${idEvenement}/importer-invites/`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },

  mesEvenements: () => apiClient.get<EvenementMembre[]>('/membre/evenements/').then((r) => r.data),

  confirmer: (idEvenement: number) =>
    apiClient
      .post<{ message: string; statut: StatutConfirmation; nb_confirmes: number }>(
        `/evenement/${idEvenement}/confirmer/`,
      )
      .then((r) => r.data),

  annulerConfirmation: (idEvenement: number) =>
    apiClient
      .delete<{ message: string }>(`/evenement/${idEvenement}/annuler-confirmation/`)
      .then((r) => r.data),

  acterProgramme: (idEvenement: number) =>
    apiClient
      .post<{ success: boolean; statut: string; membres_notifies: number }>(
        `/admin/evenement/${idEvenement}/acter-programme/`,
      )
      .then((r) => r.data),
}

