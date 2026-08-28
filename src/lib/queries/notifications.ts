import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api/notifications'

export const notificationsKeys = {
  liste: (nonLues?: boolean) => ['notifications', 'liste', nonLues ?? null] as const,
}

export function useNotifications(nonLues?: boolean, options: { refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: notificationsKeys.liste(nonLues),
    queryFn: () => notificationsApi.liste(nonLues),
    refetchInterval: options.refetchInterval,
  })
}

export function useMarquerNotificationLue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.marquerLu(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useToutMarquerLu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.toutMarquerLu,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
