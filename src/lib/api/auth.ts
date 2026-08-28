import { apiClient } from './client'
import type { CurrentUser, MonProfilCompte } from './types'

export const authApi = {
  login: (email: string, mot_de_passe: string) =>
    apiClient.post<CurrentUser>('/login/', { email, mot_de_passe }).then((r) => r.data),

  changerMotDePasse: (ancien_mot_de_passe: string, nouveau_mot_de_passe: string) =>
    apiClient
      .post('/changer-mot-de-passe/', { ancien_mot_de_passe, nouveau_mot_de_passe })
      .then((r) => r.data),

  monProfil: () => apiClient.get<MonProfilCompte>('/mon-profil/').then((r) => r.data),

  modifierProfil: (payload: Partial<{ nom: string; prenom: string; telephone: string }>) =>
    apiClient.patch('/mon-profil/modifier/', payload).then((r) => r.data),

  televerserPhoto: (photo: File) => {
    const form = new FormData()
    form.append('photo', photo)
    return apiClient
      .post<{ photo: string }>('/mon-profil/photo/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
