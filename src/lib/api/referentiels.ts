import { apiClient } from './client'
import type { DefinitionIndicateur, NiveauZone, Partenaire, TypeAction, Zone } from './types'

export type ZonePayload = { nom: string; niveau: NiveauZone; parent: number | null; actif?: boolean }

export type PartenairePayload = Omit<Partenaire, 'id_partenaire' | 'zone_chemin' | 'date_creation'>

export type TypeActionPayload = Omit<TypeAction, 'id_type_action' | 'code' | 'indicateurs'>

export type IndicateurPayload = Omit<DefinitionIndicateur, 'id_indicateur' | 'type_action' | 'code' | 'ordre'>

export const referentielsApi = {
  zones: (params: { parent?: number | 'racine'; niveau?: NiveauZone; q?: string; inclure_inactives?: boolean } = {}) =>
    apiClient
      .get<Zone[]>('/referentiels/zones/', {
        params: { ...params, inclure_inactives: params.inclure_inactives ? '1' : undefined },
      })
      .then((r) => r.data),
  creerZone: (payload: ZonePayload) => apiClient.post<Zone>('/admin/zones/', payload).then((r) => r.data),
  modifierZone: (idZone: number, payload: Partial<ZonePayload>) =>
    apiClient.patch<Zone>(`/admin/zones/${idZone}/`, payload).then((r) => r.data),
  supprimerZone: (idZone: number): Promise<void> => apiClient.delete(`/admin/zones/${idZone}/`).then(() => undefined),

  partenaires: (params: { q?: string; inclure_inactifs?: boolean } = {}) =>
    apiClient
      .get<Partenaire[]>('/admin/partenaires/', {
        params: { q: params.q || undefined, inclure_inactifs: params.inclure_inactifs ? '1' : undefined },
      })
      .then((r) => r.data),
  creerPartenaire: (payload: PartenairePayload) =>
    apiClient.post<Partenaire>('/admin/partenaires/', payload).then((r) => r.data),
  modifierPartenaire: (idPartenaire: number, payload: Partial<PartenairePayload>) =>
    apiClient.patch<Partenaire>(`/admin/partenaires/${idPartenaire}/`, payload).then((r) => r.data),
  supprimerPartenaire: (idPartenaire: number): Promise<void> =>
    apiClient.delete(`/admin/partenaires/${idPartenaire}/`).then(() => undefined),

  typesAction: (inclureInactifs = false) =>
    apiClient
      .get<TypeAction[]>('/referentiels/types-action/', {
        params: { inclure_inactifs: inclureInactifs ? '1' : undefined },
      })
      .then((r) => r.data),
  creerTypeAction: (payload: TypeActionPayload) =>
    apiClient.post<TypeAction>('/admin/types-action/', payload).then((r) => r.data),
  modifierTypeAction: (idTypeAction: number, payload: Partial<TypeActionPayload>) =>
    apiClient.patch<TypeAction>(`/admin/types-action/${idTypeAction}/`, payload).then((r) => r.data),
  supprimerTypeAction: (idTypeAction: number): Promise<void> =>
    apiClient.delete(`/admin/types-action/${idTypeAction}/`).then(() => undefined),

  creerIndicateur: (idTypeAction: number, payload: IndicateurPayload) =>
    apiClient
      .post<DefinitionIndicateur>(`/admin/types-action/${idTypeAction}/indicateurs/`, payload)
      .then((r) => r.data),
  modifierIndicateur: (idIndicateur: number, payload: Partial<IndicateurPayload> & { ordre?: number }) =>
    apiClient.patch<DefinitionIndicateur>(`/admin/indicateurs/${idIndicateur}/`, payload).then((r) => r.data),
  supprimerIndicateur: (idIndicateur: number): Promise<void> =>
    apiClient.delete(`/admin/indicateurs/${idIndicateur}/`).then(() => undefined),
}
