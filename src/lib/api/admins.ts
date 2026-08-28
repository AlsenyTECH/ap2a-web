import { apiClient } from './client'
import type { AdminListItem, PermissionCode } from './types'

export const adminsApi = {
  nommerAdmin: (id_compte: number, permissions: PermissionCode[]) =>
    apiClient
      .post<{ message: string; permissions: PermissionCode[] }>('/admin/nommer-admin-v2/', {
        id_compte,
        permissions,
      })
      .then((r) => r.data),

  liste: () => apiClient.get<AdminListItem[]>('/admin/liste-admins/').then((r) => r.data),

  destituer: (idCompte: number) =>
    apiClient
      .post<{ email: string; est_admin: false }>(`/admin/destituer-admin/${idCompte}/`)
      .then((r) => r.data),

  permissions: (idCompte: number) =>
    apiClient
      .get<{
        id_compte: number
        nom: string
        prenom: string
        est_super_admin: boolean
        permissions: PermissionCode[]
        permissions_disponibles: { code: PermissionCode; libelle: string }[]
      }>(`/admin/permissions/${idCompte}/`)
      .then((r) => r.data),

  modifierPermissions: (idCompte: number, permissions: PermissionCode[]) =>
    apiClient
      .put<{ message: string; permissions: PermissionCode[] }>(`/admin/permissions/${idCompte}/modifier/`, {
        permissions,
      })
      .then((r) => r.data),
}
