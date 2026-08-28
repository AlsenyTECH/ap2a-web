import { apiClient } from './client'
import type { ConfigAssociation } from './types'

export const configApi = {
  obtenir: () => apiClient.get<ConfigAssociation>('/admin/config/').then((r) => r.data),

  modifierConfig: (payload: Partial<Omit<ConfigAssociation, 'logo'>>, logo?: File) => {
    if (logo) {
      const form = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, String(value))
        }
      })
      form.append('logo', logo)
      return apiClient
        .put<{ message: string }>('/admin/config/modifier/', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data)
    }
    return apiClient.put<{ message: string }>('/admin/config/modifier/', payload).then((r) => r.data)
  },
}
