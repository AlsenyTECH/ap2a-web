import { apiClient } from './client'
import type { NotificationItem } from './types'

export const notificationsApi = {
  liste: (nonLues?: boolean) =>
    apiClient
      .get<{ nb_non_lues: number; notifications: NotificationItem[] }>('/notifications/', {
        params: { non_lues: nonLues ?? undefined },
      })
      .then((r) => r.data),

  marquerLu: (idNotification: number) =>
    apiClient.post<{ message: string }>(`/notifications/${idNotification}/lu/`).then((r) => r.data),

  toutMarquerLu: () =>
    apiClient.post<{ message: string }>('/notifications/tout-lu/').then((r) => r.data),
}
