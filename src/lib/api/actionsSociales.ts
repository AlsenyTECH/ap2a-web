import { apiClient } from './client'
import type { ActionSocialeDetail, ActionSocialeListItem, StatutActionSociale, TypeActionSociale } from './types'

export const actionsSocialesApi = {
  creer: (payload: {
    titre: string
    type_action: TypeActionSociale
    description?: string
    lieu?: string
    date_debut: string
    date_fin?: string
    statut?: StatutActionSociale
    contenu_don?: string
  }) =>
    apiClient
      .post<{ message: string; id_action: number; titre: string }>('/admin/action-sociale/', payload)
      .then((r) => r.data),

  liste: (params: { type?: TypeActionSociale; statut?: StatutActionSociale } = {}) =>
    apiClient
      .get<ActionSocialeListItem[]>('/actions-sociales/', {
        params: {
          type: params.type || undefined,
          statut: params.statut || undefined,
        },
      })
      .then((r) => r.data),

  detail: (idAction: number) =>
    apiClient.get<ActionSocialeDetail>(`/admin/action-sociale/${idAction}/`).then((r) => r.data),

  modifier: (
    idAction: number,
    payload: Partial<{
      titre: string
      type_action: TypeActionSociale
      description: string
      lieu: string
      date_debut: string
      date_fin: string
      statut: StatutActionSociale
      contenu_don: string
    }>,
  ) =>
    apiClient.patch<{ message: string; id_action: number; statut: string }>(`/admin/action-sociale/${idAction}/`, payload).then((r) => r.data),

  supprimer: (idAction: number): Promise<void> =>
    apiClient.delete(`/admin/action-sociale/${idAction}/`).then(() => undefined),

  ajouterBeneficiaire: (
    idAction: number,
    payload: {
      nom: string
      prenom: string
      telephone?: string
      sexe?: string
      date_naissance?: string
      numero_identification?: string
      adresse?: string
      notes?: string
      type_aide_recue?: string
      type_commerce?: string
      localisation_commerce?: string
      capital_depart_fourni?: string
      montant_accompagnement?: string
      domaine_atelier?: string
      equipement_fourni?: string
      local_mis_a_disposition?: boolean
      type_soin?: string
      date_consultation?: string
      medecin_referent?: string
      traitement_fourni?: string
    },
  ) =>
    apiClient
      .post<{ message: string; id_beneficiaire: number; id_participation: number; nouveau: boolean }>(
        `/admin/action-sociale/${idAction}/beneficiaire/`,
        payload,
      )
      .then((r) => r.data),

  importerExcel: (idAction: number, fichier: File) => {
    const form = new FormData()
    form.append('fichier', fichier)
    return apiClient
      .post<{ message: string; crees: number; doublons: number; erreurs: string[] }>(
        `/admin/action-sociale/${idAction}/importer-excel/`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },

  modifierBeneficiaire: (
    idBeneficiaire: number,
    payload: Partial<{
      nom: string
      prenom: string
      telephone: string
      sexe: string
      date_naissance: string
      numero_identification: string
      adresse: string
    }>,
  ) =>
    apiClient
      .patch<{ message: string; id_beneficiaire: number }>(`/admin/beneficiaire/${idBeneficiaire}/`, payload)
      .then((r) => r.data),

  modifierParticipation: (
    idAction: number,
    idParticipation: number,
    payload: Partial<{ statut: string; notes: string; type_aide_recue: string }>,
  ) =>
    apiClient
      .patch<{ id_participation: number; statut: string; notes: string | null; type_aide_recue: string | null }>(
        `/admin/action-sociale/${idAction}/participation/${idParticipation}/`,
        payload,
      )
      .then((r) => r.data),

  retirerBeneficiaire: (idAction: number, idParticipation: number): Promise<void> =>
    apiClient
      .delete(`/admin/action-sociale/${idAction}/participation/${idParticipation}/`)
      .then(() => undefined),

  basculerDonRecu: (idAction: number, idParticipation: number) =>
    apiClient
      .post<{ id_participation: number; don_recu: boolean; date_reception_don: string | null; statut: string }>(
        `/admin/action-sociale/${idAction}/participation/${idParticipation}/basculer-don/`,
      )
      .then((r) => r.data),

  mettreAJourSuiviMedical: (
    idAction: number,
    idParticipation: number,
    payload: {
      a_ete_visite?: boolean
      date_visite?: string | null
      necessite_traitement?: boolean
      description_besoin_traitement?: string
      traitement_effectue?: boolean
      date_traitement?: string | null
      notes_suivi?: string
      type_soin?: string
      medecin_referent?: string
    },
  ) =>
    apiClient
      .post<{
        id_participation: number
        a_ete_visite: boolean
        date_visite: string | null
        necessite_traitement: boolean
        description_besoin_traitement: string
        traitement_effectue: boolean
        date_traitement: string | null
        notes_suivi: string
      }>(
        `/admin/action-sociale/${idAction}/participation/${idParticipation}/suivi-medical/`,
        payload,
      )
      .then((r) => r.data),
}

