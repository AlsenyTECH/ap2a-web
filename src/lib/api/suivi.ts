import { apiClient } from './client'
import type { MoyenContact, StatutGlobalSuivi, SuiviDetail, SuiviParticipant } from './types'

export const suiviApi = {
  creer: (payload: {
    id_participant: number
    id_cohorte: number
    date_suivi?: string
    moyen_contact?: MoyenContact
    kit_remis?: boolean
    certificat_emis?: boolean
    activite_lancee?: boolean
    type_activite?: string
    localisation_activite?: string
    difficultes?: string
    niveau_satisfaction?: number
    recommandations?: string
    statut_global?: StatutGlobalSuivi
  }) =>
    apiClient
      .post<{ message: string; id_suivi: number }>('/admin/suivi-formation/', payload)
      .then((r) => r.data),

  suivisCohorte: (idCohorte: number) =>
    apiClient
      .get<{
        cohorte: string
        formation: string
        duree_suivi_jours: number
        participants: SuiviParticipant[]
      }>(`/admin/cohorte/${idCohorte}/suivis/`)
      .then((r) => r.data),

  suivisParticipant: (idParticipant: number) =>
    apiClient
      .get<{ participant: string; suivis: SuiviDetail[] }>(`/admin/participant/${idParticipant}/suivis/`)
      .then((r) => r.data),
}
