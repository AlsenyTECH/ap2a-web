import { apiClient } from './client'
import type {
  CohorteDetail,
  CohorteListItem,
  Formation,
  MesCohortes,
  ParticipantCohorteListItem,
  ParticipantDetail,
  PublicCibleType,
  SeanceCohorte,
  StatutCohorte,
} from './types'

export const formationsApi = {
  liste: () => apiClient.get<Formation[]>('/formations/').then((r) => r.data),

  creer: (payload: {
    titre: string
    code_reference?: string
    description?: string
    domaine?: string
    duree_heures?: number
    prerequis?: string
  }) =>
    apiClient
      .post<{ id_formation: number; titre: string }>('/admin/formation/', payload)
      .then((r) => r.data),

  modifier: (
    idFormation: number,
    payload: Partial<{
      titre: string
      code_reference: string
      description: string
      domaine: string
      duree_heures: number
      prerequis: string
    }>,
  ) =>
    apiClient
      .patch<{ id_formation: number; titre: string }>(`/admin/formation/${idFormation}/`, payload)
      .then((r) => r.data),

  supprimer: (idFormation: number): Promise<void> =>
    apiClient.delete(`/admin/formation/${idFormation}/`).then(() => undefined),

  cohortes: (idFormation: number) =>
    apiClient.get<CohorteListItem[]>(`/formation/${idFormation}/cohortes/`).then((r) => r.data),

  creerCohorte: (payload: {
    id_formation: number
    code_cohorte: string
    lieu: string
    formateur?: string
    capacite_max?: number
    capacite_min?: number
    materiel_necessaire?: string
    est_payante?: boolean
    prix?: string
    prix_adherent?: string
    date_limite_inscription?: string
    conditions_annulation?: string
    financeur?: string
    numero_convention?: string
    public_cible_type?: PublicCibleType
    /** Requis si public_cible_type === 'SPECIFIQUE'. */
    membres_cibles?: number[]
    seances: Array<{
      date_seance: string
      heure_fin?: string
      lieu?: string
      titre_seance?: string
      type_seance?: string
      formateur_seance?: string
    }>
  }) =>
    apiClient
      .post<{ id_cohorte: number; code_cohorte: string }>('/admin/cohorte/', payload)
      .then((r) => r.data),

  changerStatutCohorte: (idCohorte: number, statut: StatutCohorte) =>
    apiClient
      .post<{ id_cohorte: number; statut: StatutCohorte }>(`/admin/cohorte/${idCohorte}/statut/`, { statut })
      .then((r) => r.data),

  terminerCohorte: (idCohorte: number) =>
    apiClient
      .post<{ id_cohorte: number; statut: StatutCohorte }>(`/admin/cohorte/${idCohorte}/terminer/`)
      .then((r) => r.data),

  detailCohorte: (idCohorte: number) =>
    apiClient.get<CohorteDetail>(`/admin/cohorte/${idCohorte}/`).then((r) => r.data),

  modifierCohorte: (idCohorte: number, payload: Record<string, unknown>) =>
    apiClient
      .patch<Record<string, unknown>>(`/admin/cohorte/${idCohorte}/modifier/`, payload)
      .then((r) => r.data),

  supprimerCohorte: (idCohorte: number): Promise<void> =>
    apiClient.delete(`/admin/cohorte/${idCohorte}/modifier/`).then(() => undefined),

  inscription: (idCohorte: number) =>
    apiClient
      .post<{ inscrit: true; cohorte: unknown }>(`/cohorte/${idCohorte}/inscription/`)
      .then((r) => r.data),

  mesCohortes: () => apiClient.get<MesCohortes[]>('/membre/mes-cohortes/').then((r) => r.data),

  seancesCohorte: (idCohorte: number) =>
    apiClient.get<SeanceCohorte[]>(`/cohorte/${idCohorte}/seances/`).then((r) => r.data),

  ajouterSeance: (
    idCohorte: number,
    payload: {
      date_seance: string
      heure_fin?: string
      lieu?: string
      titre_seance?: string
      type_seance?: string
      formateur_seance?: string
    },
  ) =>
    apiClient
      .post<{ id_seance_cohorte: number; numero_ordre: number; date_seance: string; titre_seance?: string }>(
        `/admin/cohorte/${idCohorte}/seances/`,
        payload,
      )
      .then((r) => r.data),

  modifierSeance: (
    idSeanceCohorte: number,
    payload: Partial<{
      date_seance: string
      heure_fin: string
      lieu: string
      titre_seance: string
      type_seance: string
      formateur_seance: string
    }>,
  ) =>
    apiClient
      .patch<SeanceCohorte>(`/admin/seance-cohorte/${idSeanceCohorte}/`, payload)
      .then((r) => r.data),

  supprimerSeance: (idSeanceCohorte: number): Promise<void> =>
    apiClient.delete(`/admin/seance-cohorte/${idSeanceCohorte}/`).then(() => undefined),

  retirerParticipant: (idInscription: number): Promise<void> =>
    apiClient.delete(`/admin/inscription/${idInscription}/`).then(() => undefined),

  participants: (idCohorte: number) =>
    apiClient
      .get<ParticipantCohorteListItem[]>(`/admin/cohorte/${idCohorte}/participants/`)
      .then((r) => r.data),

  ajouterParticipant: (
    idCohorte: number,
    payload: { nom: string; prenom: string; telephone?: string; numero_carte_identite?: string },
  ) =>
    apiClient
      .post<{ id_participant: number; numero_badge: string; badge: string }>(
        `/admin/cohorte/${idCohorte}/participant/`,
        payload,
      )
      .then((r) => r.data),

  importerExcel: (idCohorte: number, fichier: File) => {
    const form = new FormData()
    form.append('fichier', fichier)
    return apiClient
      .post<{ nouveaux: number; reconnus: number; ignores: number }>(
        `/admin/cohorte/${idCohorte}/importer-excel/`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },

  detailParticipant: (idParticipant: number) =>
    apiClient.get<ParticipantDetail>(`/admin/participant/${idParticipant}/`).then((r) => r.data),

  modifierParticipant: (
    idParticipant: number,
    payload: Partial<{ nom: string; prenom: string; telephone: string; numero_carte_identite: string }>,
  ) =>
    apiClient
      .patch<{ id_participant: number; nom: string; prenom: string }>(
        `/admin/participant/${idParticipant}/modifier/`,
        payload,
      )
      .then((r) => r.data),

  televerserPhotoParticipant: (idParticipant: number, photo: File) => {
    const form = new FormData()
    form.append('photo', photo)
    return apiClient
      .post<{ photo: string }>(`/admin/participant/${idParticipant}/photo/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  /**
   * QR/NFC : `ticket_scan` renvoyé par la vérification du badge.
   * MANUEL (gestionnaires des formations uniquement) : `id_participant`.
   */
  confirmerPresence: (
    payload: { id_seance_cohorte: number } & (
      | { methode_scan: 'QR' | 'NFC'; ticket_scan: string }
      | { methode_scan: 'MANUEL'; id_participant: number }
    ),
  ) =>
    apiClient
      .post<{
        confirme: boolean
        participant: string
        cohorte: string
        seance: number
        heure_arrivee: string
      }>('/confirmer-presence-cohorte/', payload)
      .then((r) => r.data),

  telechargerBadgesCohortePdf: async (
    idCohorte: number,
    participantsIds?: number[],
    inclurePhoto = true,
  ): Promise<Blob> => {
    const response = await apiClient.post(
      `/cohorte/${idCohorte}/badges/pdf/`,
      { participants_ids: participantsIds || [], inclure_photo: inclurePhoto },
      { responseType: 'blob' },
    )
    return response.data
  },

  telechargerBadgeParticipantPdf: async (
    idCohorte: number,
    idParticipant: number,
    inclurePhoto = true,
  ): Promise<Blob> => {
    const response = await apiClient.get(`/cohorte/${idCohorte}/badge/${idParticipant}/`, {
      params: { inclure_photo: inclurePhoto },
      responseType: 'blob',
    })
    return response.data
  },

  telechargerCertificatsLotPdf: async (idCohorte: number, participantsIds?: number[]): Promise<Blob> => {
    const response = await apiClient.post(
      `/cohorte/${idCohorte}/certificats/pdf-lot/`,
      { participants_ids: participantsIds || [] },
      { responseType: 'blob' },
    )
    return response.data
  },

  acterProgrammeCohorte: (idCohorte: number) =>
    apiClient
      .post<{ success: boolean; statut: string; membres_notifies: number }>(
        `/admin/cohorte/${idCohorte}/acter-programme/`,
      )
      .then((r) => r.data),
}

