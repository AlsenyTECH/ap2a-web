import { apiClient } from './client'
import type {
  ActionFiche,
  Besoin,
  ElementCalendrier,
  MesActions,
  PageActions,
  PhaseTache,
  PrioriteBesoin,
  RolePartenaire,
  StatutAction,
  StatutActionCible,
  StatutBesoin,
  StatutEquipe,
  ValeurIndicateurJson,
} from './types'

export interface ActionPayload {
  titre: string
  type_action: number
  description?: string
  date_debut: string
  date_fin?: string | null
  lieu?: string
  zone?: number | null
  responsable?: number | null
  budget_prevu?: number | null
  budget_realise?: number | null
  appel_volontaires?: boolean
  volontaires_souhaites?: number | null
  bilan?: string
}

export interface FiltresActions {
  statut?: string
  type?: number
  zone?: number
  q?: string
  page?: number
}

export interface SaisieValeur {
  indicateur: number
  action_cible: number | null
  valeur: ValeurIndicateurJson
}

const fiche = (r: { data: ActionFiche }) => r.data

export const actionsApi = {
  liste: (filtres: FiltresActions = {}) =>
    apiClient
      .get<PageActions>('/admin/actions/', { params: { ...filtres, q: filtres.q || undefined } })
      .then((r) => r.data),
  fiche: (id: number) => apiClient.get<ActionFiche>(`/admin/actions/${id}/`).then(fiche),
  creer: (payload: ActionPayload & { cibles?: number[]; besoins?: number[] }) =>
    apiClient.post<ActionFiche>('/admin/actions/', payload).then(fiche),
  modifier: (id: number, payload: Partial<ActionPayload>) =>
    apiClient.patch<ActionFiche>(`/admin/actions/${id}/`, payload).then(fiche),
  supprimer: (id: number): Promise<void> => apiClient.delete(`/admin/actions/${id}/`).then(() => undefined),
  changerStatut: (id: number, statut: StatutAction) =>
    apiClient.post<ActionFiche>(`/admin/actions/${id}/statut/`, { statut }).then(fiche),

  ajouterCibles: (id: number, payload: { cibles?: number[]; besoins?: number[] }) =>
    apiClient.post<{ ajoutees: number; fiche: ActionFiche }>(`/admin/actions/${id}/cibles/`, payload).then((r) => r.data.fiche),
  modifierCible: (idActionCible: number, payload: { statut?: StatutActionCible; notes?: string; date_intervention?: string | null }) =>
    apiClient.patch<ActionFiche>(`/admin/action-cibles/${idActionCible}/`, payload).then(fiche),
  retirerCible: (idActionCible: number) =>
    apiClient.delete<ActionFiche>(`/admin/action-cibles/${idActionCible}/`).then(fiche),
  statutCiblesLot: (id: number, ids: number[], statut: StatutActionCible) =>
    apiClient.post<ActionFiche>(`/admin/actions/${id}/cibles/statut/`, { ids, statut }).then(fiche),
  enregistrerValeurs: (id: number, valeurs: SaisieValeur[]) =>
    apiClient.put<ActionFiche>(`/admin/actions/${id}/valeurs/`, { valeurs }).then(fiche),

  ajouterPartenaire: (id: number, payload: { partenaire: number; role: RolePartenaire; montant_apport?: number | null; notes?: string }) =>
    apiClient.post<ActionFiche>(`/admin/actions/${id}/partenaires/`, payload).then(fiche),
  retirerPartenaire: (idLien: number) =>
    apiClient.delete<ActionFiche>(`/admin/action-partenaires/${idLien}/`).then(fiche),

  affecterMembres: (id: number, membres: number[], role: string) =>
    apiClient.post<ActionFiche>(`/admin/actions/${id}/equipe/`, { membres, role }).then(fiche),
  modifierEquipier: (idLigne: number, payload: { role?: string; statut?: StatutEquipe; present?: boolean | null }) =>
    apiClient.patch<ActionFiche>(`/admin/equipe/${idLigne}/`, payload).then(fiche),
  retirerEquipier: (idLigne: number) => apiClient.delete<ActionFiche>(`/admin/equipe/${idLigne}/`).then(fiche),

  ajouterTache: (id: number, payload: { titre: string; phase: PhaseTache; responsable?: number | null; echeance?: string | null }) =>
    apiClient.post<ActionFiche>(`/admin/actions/${id}/taches/`, payload).then(fiche),
  modifierTache: (idTache: number, payload: { faite?: boolean; titre?: string; echeance?: string | null }) =>
    apiClient.patch<ActionFiche>(`/admin/taches/${idTache}/`, payload).then(fiche),
  supprimerTache: (idTache: number) => apiClient.delete<ActionFiche>(`/admin/taches/${idTache}/`).then(fiche),

  besoins: (params: { statut?: string; type?: number; zone?: number; cible?: number } = {}) =>
    apiClient.get<Besoin[]>('/admin/besoins/', { params }).then((r) => r.data),
  ajouterBesoin: (idCible: number, payload: { description: string; priorite: PrioriteBesoin; type_action?: number | null; notes?: string }) =>
    apiClient.post<Besoin>(`/admin/cibles/${idCible}/besoins/`, payload).then((r) => r.data),
  modifierBesoin: (idBesoin: number, payload: { statut?: StatutBesoin; priorite?: PrioriteBesoin; description?: string }) =>
    apiClient.patch<Besoin>(`/admin/besoins/${idBesoin}/`, payload).then((r) => r.data),
  supprimerBesoin: (idBesoin: number): Promise<void> => apiClient.delete(`/admin/besoins/${idBesoin}/`).then(() => undefined),

  calendrier: (debut: string, fin: string) =>
    apiClient.get<ElementCalendrier[]>('/admin/calendrier/', { params: { debut, fin } }).then((r) => r.data),

  mesActions: () => apiClient.get<MesActions>('/membre/actions/').then((r) => r.data),
  seProposer: (id: number) => apiClient.post(`/membre/actions/${id}/volontaire/`).then(() => undefined),
  seRetirer: (id: number) => apiClient.delete(`/membre/actions/${id}/volontaire/`).then(() => undefined),
}
