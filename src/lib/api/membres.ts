import { apiClient } from './client'
import type { CompteRecherche, FonctionAssociation, MembreDetail, MembreListItem, Section, StatutCarte } from './types'

export const membresApi = {
  sections: () => apiClient.get<Section[]>('/admin/sections/').then((r) => r.data),

  liste: (params: { q?: string; statut_carte?: StatutCarte; id_section?: number; fonction?: FonctionAssociation; tri?: string } = {}) =>
    apiClient
      .get<MembreListItem[]>('/admin/membres/', {
        params: {
          q: params.q || undefined,
          statut_carte: params.statut_carte || undefined,
          id_section: params.id_section ?? undefined,
          fonction: params.fonction || undefined,
          tri: params.tri || undefined,
        },
      })
      .then((r) => r.data),

  detail: (idMembre: number) =>
    apiClient.get<MembreDetail>(`/admin/membre/${idMembre}/`).then((r) => r.data),

  modifier: (
    idMembre: number,
    payload: Partial<{
      nom: string
      prenom: string
      email: string
      telephone: string | null
      id_section: number | null
      fonction_association: FonctionAssociation
      statut_adhesion: MembreDetail['statut_adhesion']
    }>,
  ) => apiClient.patch<MembreDetail>(`/admin/membre/${idMembre}/modifier/`, payload).then((r) => r.data),

  bloquerCarte: (idCarte: number) =>
    apiClient
      .post<{ id_carte: number; statut_carte: StatutCarte }>(`/admin/carte/${idCarte}/bloquer/`)
      .then((r) => r.data),

  activerCarte: (idCarte: number) =>
    apiClient
      .post<{ id_carte: number; statut_carte: StatutCarte }>(`/admin/carte/${idCarte}/activer/`)
      .then((r) => r.data),

  importerMembres: (fichier: File) => {
    const form = new FormData()
    form.append('fichier', fichier)
    return apiClient
      .post<{ message: string; crees: number; doublons: number; erreurs: string[] }>(
        '/admin/importer-membres/',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },

  creerParAdmin: (payload: {
    nom: string
    prenom: string
    fonction_association: FonctionAssociation
    id_section?: number
    email?: string
    telephone?: string
    mode: 'MANUEL' | 'EMAIL'
    mot_de_passe?: string
  }) =>
    apiClient
      .post<{
        id_membre: number
        numero_adherent: string
        email: string
        mot_de_passe_temporaire: string | null
        email_envoye: boolean
        mode: string
      }>('/admin/membre/creer/', payload)
      .then((r) => r.data),

  rechercheComptes: (q: string) =>
    apiClient
      .get<CompteRecherche[]>('/admin/recherche-comptes/', { params: { q } })
      .then((r) => r.data),

  renvoyerIdentifiants: (idMembre: number, email?: string) =>
    apiClient
      .post<{
        success: boolean
        numero_adherent: string
        email: string
        mot_de_passe_temporaire: string
        email_envoye: boolean
      }>(`/admin/membre/${idMembre}/renvoyer-identifiants/`, email ? { email } : undefined)
      .then((r) => r.data),
}

