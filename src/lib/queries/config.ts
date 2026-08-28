import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { configApi } from '@/lib/api/config'
import { apiErrorMessage } from '@/lib/api/client'
import type { ConfigAssociation } from '@/lib/api/types'

export const configKeys = { detail: ['config'] as const }

export function useConfig() {
  return useQuery({ queryKey: configKeys.detail, queryFn: configApi.obtenir })
}

export function useModifierConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, logo }: { payload: Partial<Omit<ConfigAssociation, 'logo'>>; logo?: File }) =>
      configApi.modifierConfig(payload, logo),
    onSuccess: () => {
      toast.success('Configuration enregistrée')
      queryClient.invalidateQueries({ queryKey: configKeys.detail })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Enregistrement impossible')),
  })
}
