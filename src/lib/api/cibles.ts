import { apiClient } from './client'
import type {
  Cible,
  CibleFiche,
  DoublonPotentiel,
  PageCibles,
  ResultatImportCibles,
  TypeCible,
} from './types'

export type CiblePayload = Partial<
  Omit<
    Cible,
    | 'id_cible'
    | 'nom_complet'
    | 'zone_chemin'
    | 'membre_numero_adherent'
    | 'date_creation'
    | 'nombre_appartenances'
    | 'nombre_actions'
  >
>

export interface FiltresCibles {
  type?: TypeCible
  q?: string
  zone?: number
  page?: number
  inclure_inactives?: boolean
}

export const ciblesApi = {
  liste: (filtres: FiltresCibles = {}) =>
    apiClient
      .get<PageCibles>('/admin/cibles/', {
        params: {
          type: filtres.type,
          q: filtres.q || undefined,
          zone: filtres.zone,
          page: filtres.page,
          inclure_inactives: filtres.inclure_inactives ? '1' : undefined,
        },
      })
      .then((r) => r.data),

  fiche: (idCible: number) => apiClient.get<CibleFiche>(`/admin/cibles/${idCible}/`).then((r) => r.data),

  /** 409 avec `code: "DOUBLONS_POTENTIELS"` et `doublons` si une cible semblable existe (sauf `forcer`). */
  creer: (payload: CiblePayload & { forcer?: boolean }) =>
    apiClient.post<Cible>('/admin/cibles/', payload).then((r) => r.data),

  modifier: (idCible: number, payload: CiblePayload) =>
    apiClient.patch<CibleFiche>(`/admin/cibles/${idCible}/`, payload).then((r) => r.data),

  supprimer: (idCible: number): Promise<void> => apiClient.delete(`/admin/cibles/${idCible}/`).then(() => undefined),

  ajouterAppartenance: (idCible: number, payload: { id_cible: number; role?: string }) =>
    apiClient
      .post<{ id_appartenance: number; fiche: CibleFiche }>(`/admin/cibles/${idCible}/appartenances/`, payload)
      .then((r) => r.data),

  supprimerAppartenance: (idAppartenance: number): Promise<void> =>
    apiClient.delete(`/admin/appartenances/${idAppartenance}/`).then(() => undefined),

  fusionner: (idCible: number, idDoublon: number) =>
    apiClient.post<CibleFiche>(`/admin/cibles/${idCible}/fusionner/`, { id_doublon: idDoublon }).then((r) => r.data),

  importer: (fichier: File) => {
    const form = new FormData()
    form.append('fichier', fichier)
    return apiClient
      .post<ResultatImportCibles>('/admin/cibles/importer-excel/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  telechargerModele: () =>
    apiClient.get<Blob>('/admin/cibles/modele-excel/', { responseType: 'blob' }).then((r) => r.data),
}

/** Doublons renvoyés par une création refusée (409), sinon null. */
export function doublonsDepuisErreur(error: unknown): DoublonPotentiel[] | null {
  const data = (error as { response?: { status?: number; data?: { code?: string; doublons?: DoublonPotentiel[] } } })
    ?.response
  if (data?.status === 409 && data.data?.code === 'DOUBLONS_POTENTIELS') return data.data.doublons ?? []
  return null
}
